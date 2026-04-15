import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// function untuk update kas masjid
const updateKasMasjid = async (pemasukanTambahan = 0, pengeluaranTambahan = 0) => {
  try {
    const kasResponse = await api.get('/kas_masjid');
    let kas = kasResponse.data[0];

    if (!kas) {
      const newKas = {
        total_pemasukan: pemasukanTambahan,
        total_pengeluaran: pengeluaranTambahan,
        saldo_akhir: pemasukanTambahan - pengeluaranTambahan
      };
      const response = await api.post('/kas_masjid', newKas);
      return response.data;
    } else {
      const updatedKas = {
        ...kas,
        total_pemasukan: Number(kas.total_pemasukan) + Number(pemasukanTambahan),
        total_pengeluaran: Number(kas.total_pengeluaran) + Number(pengeluaranTambahan),
        saldo_akhir: (Number(kas.total_pemasukan) + Number(pemasukanTambahan)) - 
                    (Number(kas.total_pengeluaran) + Number(pengeluaranTambahan))
      };
      
      // Gunakan id (bukan id_kas)
      const response = await api.patch(`/kas_masjid/${kas.id}`, updatedKas);
      return response.data;
    }
  } catch (error) {
    console.error('Error updating kas:', error);
    throw error;
  }
};

// FETCH - Ambil semua transaksi
export const fetchTransaksi = createAsyncThunk(
  'keuangan/fetchTransaksi',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/transaksi_keuangan');
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// FETCH - Ambil semua pengeluaran
export const fetchPengeluaran = createAsyncThunk(
  'keuangan/fetchPengeluaran',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/pengeluaran');
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// FETCH - Ambil data kas masjid
export const fetchKasMasjid = createAsyncThunk(
  'keuangan/fetchKasMasjid',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/kas_masjid');
      return response.data[0] || null;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ADD - Tambah transaksi infak/donasi
export const addTransaksi = createAsyncThunk(
  'keuangan/addTransaksi',
  async (transaksiData, thunkAPI) => {
    try {
      const nominal = Number(transaksiData.nominal);
      if (!nominal || nominal <= 0) {
        throw new Error('Nominal harus lebih dari 0');
      }

      // JANGAN kirim id, biarkan JSON server yang generate
      const dataToSend = {
        tanggal: transaksiData.tanggal || new Date().toISOString().split('T')[0],
        jenis_transaksi: transaksiData.jenis_transaksi || 'infak',
        metode: transaksiData.metode || 'tunai',
        nominal: nominal,
        keterangan: transaksiData.keterangan || ''
      };

      console.log('Sending transaksi data:', dataToSend);

      const response = await api.post('/transaksi_keuangan', dataToSend);
      console.log('Transaksi response:', response.data);
      
      await updateKasMasjid(nominal, 0);
      
      const kasResponse = await api.get('/kas_masjid');
      
      return {
        transaksi: response.data,
        kas: kasResponse.data[0]
      };
    } catch (error) {
      console.error('Add transaksi error:', error.response || error);
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ADD - Tambah pengeluaran
export const addPengeluaran = createAsyncThunk(
  'keuangan/addPengeluaran',
  async (pengeluaranData, thunkAPI) => {
    try {
      const nominal = Number(pengeluaranData.nominal);
      if (!nominal || nominal <= 0) {
        throw new Error('Nominal harus lebih dari 0');
      }

      const dataToSend = {
        tanggal: pengeluaranData.tanggal || new Date().toISOString().split('T')[0],
        kategori: pengeluaranData.kategori || 'Operasional',
        nominal: nominal,
        keterangan: pengeluaranData.keterangan || ''
      };

      console.log('Sending pengeluaran data:', dataToSend);

      const response = await api.post('/pengeluaran', dataToSend);
      console.log('Pengeluaran response:', response.data);
      
      await updateKasMasjid(0, nominal);
      
      const kasResponse = await api.get('/kas_masjid');
      
      return {
        pengeluaran: response.data,
        kas: kasResponse.data[0]
      };
    } catch (error) {
      console.error('Add pengeluaran error:', error.response || error);
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// DELETE - Hapus transaksi
export const deleteTransaksi = createAsyncThunk(
  'keuangan/deleteTransaksi',
  async ({ id, nominal }, thunkAPI) => {
    try {
      await api.delete(`/transaksi_keuangan/${id}`);
      await updateKasMasjid(-nominal, 0);
      const kasResponse = await api.get('/kas_masjid');
      
      return {
        id,
        kas: kasResponse.data[0]
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// DELETE - Hapus pengeluaran
export const deletePengeluaran = createAsyncThunk(
  'keuangan/deletePengeluaran',
  async ({ id, nominal }, thunkAPI) => {
    try {
      await api.delete(`/pengeluaran/${id}`);
      await updateKasMasjid(0, -nominal);
      const kasResponse = await api.get('/kas_masjid');
      
      return {
        id,
        kas: kasResponse.data[0]
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// UPDATE - Edit transaksi
export const updateTransaksi = createAsyncThunk(
  'keuangan/updateTransaksi',
  async ({ id, data, oldNominal }, thunkAPI) => {
    try {
      const selisih = Number(data.nominal) - Number(oldNominal);
      
      // Jangan kirim id di body
      const { id: _, ...dataToSend } = data;
      
      const response = await api.patch(`/transaksi_keuangan/${id}`, dataToSend);
      await updateKasMasjid(selisih, 0);
      const kasResponse = await api.get('/kas_masjid');
      
      return {
        transaksi: response.data,
        kas: kasResponse.data[0]
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// UPDATE - Edit pengeluaran
export const updatePengeluaran = createAsyncThunk(
  'keuangan/updatePengeluaran',
  async ({ id, data, oldNominal }, thunkAPI) => {
    try {
      const selisih = Number(data.nominal) - Number(oldNominal);
      
      const { id: _, ...dataToSend } = data;
      
      const response = await api.patch(`/pengeluaran/${id}`, dataToSend);
      await updateKasMasjid(0, selisih);
      const kasResponse = await api.get('/kas_masjid');
      
      return {
        pengeluaran: response.data,
        kas: kasResponse.data[0]
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);