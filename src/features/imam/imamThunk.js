// features/imam/imamThunk.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import { imamService } from '../../services/imamService';

// ─── Helper: delay antar request agar JSON Server tidak kewalahan ──────────
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ========== CRUD IMAM ==========
export const fetchImam = createAsyncThunk(
  'imam/fetchImam',
  async (_, { rejectWithValue }) => {
    try { return await imamService.getAllImam(); }
    catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
  }
);

export const addImam = createAsyncThunk(
  'imam/addImam',
  async (imamData, { rejectWithValue }) => {
    try { return await imamService.addImam(imamData); }
    catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
  }
);

export const updateImam = createAsyncThunk(
  'imam/updateImam',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await imamService.updateImam(id, data); }
    catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
  }
);

export const deleteImam = createAsyncThunk(
  'imam/deleteImam',
  async (id, { rejectWithValue }) => {
    try { await imamService.deleteImam(id); return id; }
    catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
  }
);

// ========== JADWAL JUMAT ==========
export const fetchJadwal = createAsyncThunk(
  'imam/fetchJadwal',
  async (_, { rejectWithValue }) => {
    try {
      const data = await imamService.getAllJadwal();
      return data.map(j => ({ ...j, id_jadwal: j.id_jadwal ?? j.id }));
    } catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
  }
);

// ─── Generate Jadwal ─────────────────────────────────────────────────────────
// FIX: Tambah sleep(50ms) antar POST untuk cegah ERR_SOCKET_NOT_CONNECTED.
// JSON Server adalah single-thread — kalau dibombardir 52 request tanpa jeda
// koneksinya bisa putus di tengah jalan (seperti error di jadwal ke-25, 28, 31).
//
// Return value menyertakan `gagal[]` → dipakai komponen untuk tampil alert
// "X jadwal gagal tersimpan, klik untuk isi manual"
export const generateJadwal = createAsyncThunk(
  'imam/generateJadwal',
  async ({ tahun }, { getState, rejectWithValue }) => {
    try {
      const { imam: imamList, jadwal: jadwalLamaAll } = getState().imam;

      if (!imamList || imamList.length === 0)
        throw new Error('Tidak ada imam terdaftar. Tambah imam terlebih dahulu!');

      // 1. Kumpulkan semua Jumat
      const semuaJumat = getDaftarJumat(tahun);
      console.log(`📅 ${tahun}: ${semuaJumat.length} hari Jumat`);

      // 2. Round-robin
      const jadwalList = semuaJumat.map((tanggal, i) => {
        const imam = imamList[i % imamList.length];
        return {
          tanggal_jumat: formatDate(tanggal),
          id_imam: imam.id,
          nama_imam: imam.nama_imam,
          status: 'terjadwal',
          notifikasi_terkirim: false,
          tahun,
        };
      });

      // 3. Hapus jadwal lama
      const jadwalLama = jadwalLamaAll.filter(j => Number(j.tahun) === Number(tahun));
      for (const j of jadwalLama) {
        try { await imamService.deleteJadwal(j.id ?? j.id_jadwal); }
        catch (e) { console.warn('⚠️ Gagal hapus:', e.message); }
        await sleep(30); // jeda kecil saat delete juga
      }

      // 4. Simpan satu per satu DENGAN DELAY 50ms
      // → Ini yang mencegah ERR_SOCKET_NOT_CONNECTED
      const savedJadwal = [];
      const gagalJadwal = []; // catat yang gagal untuk alert manual

      for (let i = 0; i < jadwalList.length; i++) {
        const jadwal = jadwalList[i];
        try {
          const saved = await imamService.addJadwal(jadwal);
          savedJadwal.push(saved);
          if (i < 3 || i === jadwalList.length - 1)
            console.log(`✅ [${i+1}/${jadwalList.length}] ${saved.tanggal_jumat} → ${saved.nama_imam}`);
        } catch (e) {
          console.error(`❌ Gagal ke-${i+1} (${jadwal.tanggal_jumat}):`, e.message);
          gagalJadwal.push(jadwal); // simpan data jadwal yang gagal
        }
        await sleep(50); // ← KUNCI: beri napas 50ms ke JSON Server
      }

      console.log(`🎉 ${savedJadwal.length}/${jadwalList.length} jadwal tersimpan`);
      if (gagalJadwal.length > 0)
        console.warn(`⚠️ ${gagalJadwal.length} jadwal gagal:`, gagalJadwal.map(j=>j.tanggal_jumat));

      const statistik = imamList.map(im => ({
        nama: im.nama_imam,
        jumlah: savedJadwal.filter(j => j.id_imam === im.id).length,
      }));

      return {
        tahun,
        jumlah: savedJadwal.length,
        jadwal: savedJadwal,
        gagal: gagalJadwal,          // ← jadwal yang error, untuk isi manual
        deletedIds: jadwalLama.map(j => j.id ?? j.id_jadwal),
        statistik,
      };
    } catch (e) {
      console.error('❌ generateJadwal error:', e);
      return rejectWithValue(e.message || 'Gagal generate jadwal');
    }
  }
);

// ─── Tambah Jadwal Manual (dengan cek duplikat tanggal) ──────────────────────
// Sebelum POST, cek apakah tanggal sudah ada di db.json.
// Jika sudah ada → tolak (return error "Tanggal sudah terdaftar").
// Jika belum → POST normal.
export const addJadwalManual = createAsyncThunk(
  'imam/addJadwalManual',
  async (jadwalData, { getState, rejectWithValue }) => {
    try {
      const { imam: imamList } = getState().imam;

      // Cek duplikat: GET jadwal dengan tanggal yang sama
      const existing = await imamService.getJadwalByTanggal(jadwalData.tanggal_jumat);
      if (existing && existing.length > 0) {
        return rejectWithValue(
          `Tanggal ${jadwalData.tanggal_jumat} sudah ada jadwalnya (imam: ${existing[0].nama_imam}). Tidak bisa ditambah duplikat.`
        );
      }

      const imam = imamList.find(i => i.id === Number(jadwalData.id_imam));
      const saved = await imamService.addJadwal({
        ...jadwalData,
        nama_imam: imam?.nama_imam || '',
        status: 'terjadwal',
        notifikasi_terkirim: false,
        tahun: new Date(jadwalData.tanggal_jumat).getFullYear(),
      });
      return saved;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

// ─── Isi Jadwal yang Gagal (retry jadwal dari generateJadwal yang error) ──────
// Dipakai saat user klik "Isi Jadwal Kosong" setelah generate parsial.
// Sama seperti addJadwalManual tapi menerima array dan skip yang sudah ada.
export const isiJadwalGagal = createAsyncThunk(
  'imam/isiJadwalGagal',
  async ({ jadwalGagalList }, { rejectWithValue }) => {
    const berhasil = [];
    const masihGagal = [];

    for (const jadwal of jadwalGagalList) {
      try {
        // Cek dulu apakah sudah ada (mungkin tersimpan sebagian)
        const existing = await imamService.getJadwalByTanggal(jadwal.tanggal_jumat);
        if (existing && existing.length > 0) {
          console.log(`⏭️ Skip ${jadwal.tanggal_jumat} — sudah ada`);
          berhasil.push(existing[0]);
          continue;
        }
        await sleep(80); // delay lebih besar untuk retry
        const saved = await imamService.addJadwal(jadwal);
        berhasil.push(saved);
        console.log(`✅ Retry berhasil: ${saved.tanggal_jumat}`);
      } catch (e) {
        console.error(`❌ Retry gagal: ${jadwal.tanggal_jumat}`, e.message);
        masihGagal.push(jadwal);
      }
    }

    if (masihGagal.length > 0)
      return rejectWithValue({
        berhasil,
        masihGagal,
        pesan: `${berhasil.length} berhasil, ${masihGagal.length} masih gagal`,
      });

    return { berhasil, masihGagal: [] };
  }
);

export const deleteJadwal = createAsyncThunk(
  'imam/deleteJadwal',
  async (id, { rejectWithValue }) => {
    try { await imamService.deleteJadwal(id); return id; }
    catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
  }
);

// ========== HELPERS ==========
const getDaftarJumat = (tahun) => {
  const hasil = [];
  const date = new Date(tahun, 0, 1);
  while (date.getDay() !== 5) date.setDate(date.getDate() + 1);
  while (date.getFullYear() === tahun) {
    hasil.push(new Date(date));
    date.setDate(date.getDate() + 7);
  }
  return hasil;
};

const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};
