import api from "./api";

export const getKonfigurasiMasjid = async () => {
  const res = await api.get("/konfigurasi_masjid");
  // ambil data pertama (karena array)
  return res.data[0];
};