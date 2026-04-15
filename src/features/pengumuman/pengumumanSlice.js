import { createSlice } from "@reduxjs/toolkit";
import { 
  fetchPengumuman, 
  addPengumuman, 
  updatePengumuman, 
  deletePengumuman, 
  togglePengumumanAktif 
} from "./pengumumanThunk";

const pengumumanSlice = createSlice({
  name: 'pengumuman',
  initialState: {
    pengumuman: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Pengumuman
      .addCase(fetchPengumuman.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPengumuman.fulfilled, (state, action) => {
        state.loading = false;
        state.pengumuman = action.payload;
      })
      .addCase(fetchPengumuman.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add Pengumuman
      .addCase(addPengumuman.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPengumuman.fulfilled, (state, action) => {
        state.loading = false;
        state.pengumuman.push(action.payload);
      })
      .addCase(addPengumuman.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Pengumuman
      .addCase(updatePengumuman.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePengumuman.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.pengumuman.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.pengumuman[index] = action.payload;
        }
      })
      .addCase(updatePengumuman.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Pengumuman
      .addCase(deletePengumuman.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePengumuman.fulfilled, (state, action) => {
        state.loading = false;
        state.pengumuman = state.pengumuman.filter(p => p.id !== action.payload);
      })
      .addCase(deletePengumuman.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Toggle Aktif
      .addCase(togglePengumumanAktif.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(togglePengumumanAktif.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.pengumuman.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.pengumuman[index] = action.payload;
        }
      })
      .addCase(togglePengumumanAktif.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = pengumumanSlice.actions;
export default pengumumanSlice.reducer;