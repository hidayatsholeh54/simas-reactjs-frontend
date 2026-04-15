// services/imamService.js
import api from './api';

export const imamService = {
  // ========== MANAJEMEN IMAM ==========
  getAllImam: async () => {
    const response = await api.get('/imam');
    return response.data;
  },

  addImam: async (imamData) => {
    const response = await api.post('/imam', imamData);
    return response.data;
  },

  updateImam: async (id, imamData) => {
    const response = await api.patch(`/imam/${id}`, imamData);
    return response.data;
  },

  deleteImam: async (id) => {
    const response = await api.delete(`/imam/${id}`);
    return response.data;
  },

  // ========== MANAJEMEN JADWAL ==========
  getAllJadwal: async () => {
    const response = await api.get('/jadwal_jumat');
    return response.data;
  },

  // JSON Server pakai "id" sebagai primary key
  // Kita kirim "id_jadwal" sebagai field tambahan saja, biar tetap bisa dipakai di UI
  addJadwal: async (jadwalData) => {
    const payload = {
      tanggal_jumat: jadwalData.tanggal_jumat,
      id_imam:       jadwalData.id_imam,
      nama_imam:     jadwalData.nama_imam,
      status:        jadwalData.status || 'terjadwal',
      notifikasi_terkirim: jadwalData.notifikasi_terkirim ?? false,
      tahun:         jadwalData.tahun,
    };
    const response = await api.post('/jadwal_jumat', payload);
    // JSON Server akan otomatis generate "id" → kita copy ke "id_jadwal" buat konsistensi
    const saved = response.data;
    return { ...saved, id_jadwal: saved.id };
  },

  // Cek apakah tanggal sudah ada (untuk cegah duplikat)
  getJadwalByTanggal: async (tanggal) => {
    const response = await api.get(`/jadwal_jumat?tanggal_jumat=${tanggal}`);
    return response.data;
  },

    updateJadwal: async (id, jadwalData) => {
    const response = await api.patch(`/jadwal_jumat/${id}`, jadwalData);
    return response.data;
  },

  deleteJadwal: async (id) => {
    const response = await api.delete(`/jadwal_jumat/${id}`);
    return response.data;
  },

  // NOTIFIKASI
  kirimNotifikasi: async ({ namaImam, kontak, tanggalJumat }) => {
    const tanggalFormatted = new Date(tanggalJumat).toLocaleDateString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    const pesan =
      `Assalamu'alaikum Ustadz ${namaImam},\n\n` +
      `Pengingat: Anda dijadwalkan sebagai Imam Sholat Jumat pada:\n` +
      `📅 ${tanggalFormatted}\n\n` +
      `Mohon konfirmasi kehadiran. Jazakallah khairan.`;

    console.log('📨 NOTIFIKASI TERKIRIM');
    console.log('👤 Kepada :', namaImam);
    console.log('📞 Kontak :', kontak);
    console.log('💬 Pesan  :\n', pesan);

    // Uncomment untuk integrasi WhatsApp via Fonnte:
    // const FONNTE_TOKEN = 'ISI_TOKEN_ANDA';
    // await fetch('https://fontee.id/api/send', {
    //   method: 'POST',
    //   headers: { Authorization: FONNTE_TOKEN },
    //   body: new URLSearchParams({ target: kontak, message: pesan }),
    // });

    await new Promise(r => setTimeout(r, 300));
    return { success: true, pesan, waktuKirim: new Date().toISOString() };
  },
};
