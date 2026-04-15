import { createSlice } from "@reduxjs/toolkit";
import {
  fetchTransaksi,
  fetchPengeluaran,
  fetchKasMasjid,
  addTransaksi,
  addPengeluaran,
  deleteTransaksi,
  deletePengeluaran,
  updateTransaksi,
  updatePengeluaran
} from "./keuanganThunk";

const keuanganSlice = createSlice({
  name: 'keuangan',
  initialState: {
    transaksi: [],
    pengeluaran: [],
    kas: null,
    loading: false,
    error: null,
    success: null
  },
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Transaksi
      .addCase(fetchTransaksi.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransaksi.fulfilled, (state, action) => {
        state.loading = false;
        state.transaksi = action.payload;
      })
      .addCase(fetchTransaksi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Pengeluaran
      .addCase(fetchPengeluaran.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPengeluaran.fulfilled, (state, action) => {
        state.loading = false;
        state.pengeluaran = action.payload;
      })
      .addCase(fetchPengeluaran.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Kas Masjid
      .addCase(fetchKasMasjid.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchKasMasjid.fulfilled, (state, action) => {
        state.loading = false;
        state.kas = action.payload;
      })
      .addCase(fetchKasMasjid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add Transaksi
      .addCase(addTransaksi.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(addTransaksi.fulfilled, (state, action) => {
        state.loading = false;
        state.transaksi.push(action.payload.transaksi);
        state.kas = action.payload.kas;
        state.success = 'Transaksi infak/donasi berhasil ditambahkan!';
      })
      .addCase(addTransaksi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add Pengeluaran
      .addCase(addPengeluaran.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(addPengeluaran.fulfilled, (state, action) => {
        state.loading = false;
        state.pengeluaran.push(action.payload.pengeluaran);
        state.kas = action.payload.kas;
        state.success = 'Pengeluaran berhasil ditambahkan!';
      })
      .addCase(addPengeluaran.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Transaksi
      .addCase(deleteTransaksi.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteTransaksi.fulfilled, (state, action) => {
        state.loading = false;
        state.transaksi = state.transaksi.filter(t => t.id_transaksi !== action.payload.id);
        state.kas = action.payload.kas;
        state.success = 'Transaksi berhasil dihapus!';
      })
      .addCase(deleteTransaksi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Pengeluaran
      .addCase(deletePengeluaran.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deletePengeluaran.fulfilled, (state, action) => {
        state.loading = false;
        state.pengeluaran = state.pengeluaran.filter(p => p.id_pengeluaran !== action.payload.id);
        state.kas = action.payload.kas;
        state.success = 'Pengeluaran berhasil dihapus!';
      })
      .addCase(deletePengeluaran.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
    // Update Transaksi
    .addCase(updateTransaksi.fulfilled, (state, action) => {
    state.loading = false;
    const index = state.transaksi.findIndex(t => t.id === action.payload.transaksi.id);
    if (index !== -1) {
        state.transaksi[index] = action.payload.transaksi;
    }
    state.kas = action.payload.kas;
    state.success = 'Transaksi berhasil diperbarui!';
    })

    // Update Pengeluaran
    .addCase(updatePengeluaran.fulfilled, (state, action) => {
    state.loading = false;
    const index = state.pengeluaran.findIndex(p => p.id === action.payload.pengeluaran.id);
    if (index !== -1) {
        state.pengeluaran[index] = action.payload.pengeluaran;
    }
    state.kas = action.payload.kas;
    state.success = 'Pengeluaran berhasil diperbarui!';
    })
  }
});

export const { clearMessages } = keuanganSlice.actions;
export default keuanganSlice.reducer;