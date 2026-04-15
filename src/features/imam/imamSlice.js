// features/imam/imamSlice.js
import { createSlice } from '@reduxjs/toolkit';
import {
  fetchImam, addImam, updateImam, deleteImam,
  fetchJadwal, generateJadwal, addJadwalManual, deleteJadwal,
  isiJadwalGagal,
} from './imamThunk';

const getJadwalId = (j) => j.id_jadwal ?? j.id;

const imamSlice = createSlice({
  name: 'imam',
  initialState: {
    imam:                [],
    jadwal:              [],
    jadwalGagal:         [],   
    loading:             false,
    loadingRetry:        false, // loading khusus untuk retry/isi jadwal kosong
    error:               null,
    success:             null,
    lastGenerate:        null,
    statistikDistribusi: [],
  },
  reducers: {
    clearMessages:   (state) => { state.error = null; state.success = null; },
    clearJadwalGagal:(state) => { state.jadwalGagal = []; },
    resetState: () => ({
      imam: [], jadwal: [], jadwalGagal: [], loading: false, loadingRetry: false,
      error: null, success: null, lastGenerate: null, statistikDistribusi: [],
    }),
  },
  extraReducers: (builder) => {
    builder
      // FETCH IMAM
      .addCase(fetchImam.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(fetchImam.fulfilled, (state, { payload }) => { state.loading = false; state.imam = payload; })
      .addCase(fetchImam.rejected,  (state, { payload }) => { state.loading = false; state.error = payload; })

      // ADD IMAM
      .addCase(addImam.pending,   (state) => { state.loading = true; state.error = null; state.success = null; })
      .addCase(addImam.fulfilled, (state, { payload }) => { state.loading = false; state.imam.push(payload); state.success = 'Imam berhasil ditambahkan!'; })
      .addCase(addImam.rejected,  (state, { payload }) => { state.loading = false; state.error = payload; })

      // UPDATE IMAM
      .addCase(updateImam.pending,   (state) => { state.loading = true; state.error = null; state.success = null; })
      .addCase(updateImam.fulfilled, (state, { payload }) => {
        state.loading = false;
        const idx = state.imam.findIndex(i => i.id === payload.id);
        if (idx !== -1) state.imam[idx] = payload;
        state.success = 'Data imam berhasil diperbarui!';
      })
      .addCase(updateImam.rejected,  (state, { payload }) => { state.loading = false; state.error = payload; })

      // DELETE IMAM
      .addCase(deleteImam.pending,   (state) => { state.loading = true; state.error = null; state.success = null; })
      .addCase(deleteImam.fulfilled, (state, { payload }) => { state.loading = false; state.imam = state.imam.filter(i => i.id !== payload); state.success = 'Imam berhasil dihapus!'; })
      .addCase(deleteImam.rejected,  (state, { payload }) => { state.loading = false; state.error = payload; })

      // FETCH JADWAL
      .addCase(fetchJadwal.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(fetchJadwal.fulfilled, (state, { payload }) => { state.loading = false; state.jadwal = payload; })
      .addCase(fetchJadwal.rejected,  (state, { payload }) => { state.loading = false; state.error = payload; })

      //GENERATE JADWAL
      .addCase(generateJadwal.pending,   (state) => { state.loading = true; state.error = null; state.success = null; state.jadwalGagal = []; })
      .addCase(generateJadwal.fulfilled, (state, { payload }) => {
        state.loading = false;
        const deletedSet = new Set(payload.deletedIds);
        const sisa = state.jadwal.filter(j => !deletedSet.has(getJadwalId(j)));
        state.jadwal              = [...sisa, ...payload.jadwal];
        state.lastGenerate        = payload.tahun;
        state.statistikDistribusi = payload.statistik;
        state.jadwalGagal         = payload.gagal || []; // ← simpan yang gagal
        if (payload.gagal?.length > 0) {
          state.error   = `⚠️ ${payload.jumlah} jadwal tersimpan, ${payload.gagal.length} gagal (koneksi terputus). Klik "Isi Jadwal Kosong" untuk melengkapi.`;
        } else {
          state.success = `✅ Berhasil generate ${payload.jumlah} jadwal tahun ${payload.tahun}!`;
        }
      })
      .addCase(generateJadwal.rejected,  (state, { payload }) => { state.loading = false; state.error = payload || 'Gagal generate jadwal'; })

      //ADD JADWAL MANUAL
      .addCase(addJadwalManual.pending,   (state) => { state.loading = true; state.error = null; state.success = null; })
      .addCase(addJadwalManual.fulfilled, (state, { payload }) => { state.loading = false; state.jadwal.push(payload); state.success = 'Jadwal berhasil ditambahkan!'; })
      .addCase(addJadwalManual.rejected,  (state, { payload }) => { state.loading = false; state.error = payload; })

      // ISI JADWAL GAGAL (retry)
      .addCase(isiJadwalGagal.pending,   (state) => { state.loadingRetry = true; state.error = null; state.success = null; })
      .addCase(isiJadwalGagal.fulfilled, (state, { payload }) => {
        state.loadingRetry = false;
        // Tambah jadwal yang berhasil di-retry ke state
        state.jadwal       = [...state.jadwal, ...payload.berhasil];
        state.jadwalGagal  = []; // bersihkan antrian gagal
        state.success      = `✅ Semua jadwal kosong berhasil diisi! (${payload.berhasil.length} jadwal)`;
      })
      .addCase(isiJadwalGagal.rejected,  (state, { payload }) => {
        state.loadingRetry = false;
        // Partial success: tambah yang berhasil, sisakan yang masih gagal
        if (payload?.berhasil?.length) {
          state.jadwal      = [...state.jadwal, ...payload.berhasil];
          state.jadwalGagal = payload.masihGagal;
        }
        state.error = payload?.pesan || 'Sebagian jadwal masih gagal. Coba lagi atau tambah manual.';
      })

      // ── DELETE JADWAL ───────────────────────
      .addCase(deleteJadwal.pending,   (state) => { state.loading = true; state.error = null; state.success = null; })
      .addCase(deleteJadwal.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.jadwal  = state.jadwal.filter(j => getJadwalId(j) !== payload);
        state.success = 'Jadwal berhasil dihapus!';
      })
      .addCase(deleteJadwal.rejected,  (state, { payload }) => { state.loading = false; state.error = payload; });
  },
});

export const { clearMessages, clearJadwalGagal, resetState } = imamSlice.actions;
export default imamSlice.reducer;
