// features/notifikasi/notifikasiSlice.js
// notifikasi_terkirim diupdate OTOMATIS saat cekJadwalBesok dipanggil
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// ─── Thunk: ambil jadwal Jumat besok dari db.json ──────────────────────────
export const cekJadwalBesok = createAsyncThunk(
  'notifikasi/cekJadwalBesok',
  async (_, { rejectWithValue }) => {
    try {
      // Hitung tanggal besok
      const besok = new Date();
      besok.setDate(besok.getDate() + 1);
      const yyyy = besok.getFullYear();
      const mm   = String(besok.getMonth() + 1).padStart(2, '0');
      const dd   = String(besok.getDate()).padStart(2, '0');
      const tanggalBesok = `${yyyy}-${mm}-${dd}`;

      // Query ke JSON Server — filter langsung by tanggal
      const response = await api.get(`/jadwal_jumat?tanggal_jumat=${tanggalBesok}`);
      const jadwalBesok = response.data;

      if (!jadwalBesok || jadwalBesok.length === 0) {
        return { ada: false, tanggal: tanggalBesok, jadwal: [] };
      }

      // Ambil data imam untuk setiap jadwal
      const jadwalDenganImam = await Promise.all(
        jadwalBesok.map(async (j) => {
          try {
            const imamRes = await api.get(`/imam/${j.id_imam}`);
            return { ...j, detail_imam: imamRes.data };
          } catch {
            return { ...j, detail_imam: null };
          }
        })
      );

      return {
        ada: true,
        tanggal: tanggalBesok,
        jadwal: jadwalDenganImam,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ─── Slice ─────────────────────────────────────────────────────────────────
const notifikasiSlice = createSlice({
  name: 'notifikasi',
  initialState: {
    jadwalBesok:   [],      // jadwal Jumat besok
    tanggalBesok:  null,
    adaJadwalBesok: false,
    sudahDibaca:   false,   // apakah user sudah klik/dismiss notifikasi
    loading:       false,
    lastCek:       null,    // timestamp terakhir pengecekan
  },
  reducers: {
    tandaiSudahDibaca: (state) => {
      state.sudahDibaca = true;
    },
    resetBaca: (state) => {
      state.sudahDibaca = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(cekJadwalBesok.pending, (state) => {
        state.loading = true;
      })
      .addCase(cekJadwalBesok.fulfilled, (state, { payload }) => {
        state.loading        = false;
        state.adaJadwalBesok = payload.ada;
        state.tanggalBesok   = payload.tanggal;
        state.jadwalBesok    = payload.jadwal;
        state.lastCek        = new Date().toISOString();
        // Reset "sudah dibaca" jika tanggal berubah (hari baru)
        if (!payload.ada) state.sudahDibaca = false;
      })
      .addCase(cekJadwalBesok.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { tandaiSudahDibaca, resetBaca } = notifikasiSlice.actions;
export default notifikasiSlice.reducer;
