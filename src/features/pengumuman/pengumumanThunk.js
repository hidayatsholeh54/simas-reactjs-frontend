import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async Thunks
export const fetchPengumuman = createAsyncThunk(
  'pengumuman/fetchPengumuman',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/pengumuman');
      return response.data;
    } catch (error) {
      console.error('Fetch error:', error);
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Di pengumumanThunk.js - untuk addPengumuman
export const addPengumuman = createAsyncThunk(
  'pengumuman/addPengumuman',
  async (pengumumanData, thunkAPI) => {
    try {
      // Langsung buat object tanpa mendeklarasikan variabel yang tidak dipakai
      const dataToSend = {
        judul: pengumumanData.judul,
        deskripsi: pengumumanData.deskripsi,
        tanggal_mulai: pengumumanData.tanggal_mulai || null,
        tanggal_selesai: pengumumanData.tanggal_selesai || null,
        waktu_selesai: pengumumanData.waktu_selesai || null,
        is_aktif: pengumumanData.is_aktif
      };
      
      // Hanya kirim field yang diperlukan
      console.log('Sending data:', dataToSend);
      const response = await api.post('/pengumuman', dataToSend);
      console.log('Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Add error:', error.response || error);
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updatePengumuman = createAsyncThunk(
  'pengumuman/updatePengumuman',
  async ({ id, data }, thunkAPI) => {
    try {
      console.log('Updating data:', { id, data });
      
      // Langsung buat object tanpa destructuring yang tidak perlu
      const dataToSend = {
        judul: data.judul,
        deskripsi: data.deskripsi,
        tanggal_mulai: data.tanggal_mulai || null,
        tanggal_selesai: data.tanggal_selesai || null,
        waktu_selesai: data.waktu_selesai || null,
        is_aktif: data.is_aktif
      };
      
      const response = await api.patch(`/pengumuman/${id}`, dataToSend);
      console.log('Update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update error:', error.response || error);
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deletePengumuman = createAsyncThunk(
  'pengumuman/deletePengumuman',
  async (id, thunkAPI) => {
    try {
      await api.delete(`/pengumuman/${id}`);
      return id;
    } catch (error) {
      console.error('Delete error:', error.response || error);
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const togglePengumumanAktif = createAsyncThunk(
  'pengumuman/toggleAktif',
  async ({ id, is_aktif }, thunkAPI) => {
    try {
      const response = await api.patch(`/pengumuman/${id}`, { is_aktif });
      return response.data;
    } catch (error) {
      console.error('Toggle error:', error.response || error);
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);