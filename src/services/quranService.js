// services/quranApi.js
import axios from "axios";

const quranApi = axios.create({
  baseURL: "https://api.myquran.com/v2/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Get All Surat
export const getAllSurat = async () => {
  const res = await quranApi.get("quran/surat/semua");
  return res.data;
};

// Get Detail Surat by Number
export const getSuratDetail = async (number) => {
  const res = await quranApi.get(`quran/surat/${number}`);
  return res.data;
};

// Get Ayat by Range
export const getAyatRange = async (surat, start, end) => {
  const res = await quranApi.get(`quran/ayat/${surat}/${start}-${end}`);
  return res.data;
};

export const getJadwalSholat = async (kotaId, tanggal) => {
  const res = await quranApi.get(
    `sholat/jadwal/${kotaId}/${tanggal}`
  );
  return res.data;
};

export const getAllKota = async () => {
  const res = await quranApi.get("sholat/kota/semua");
  return res.data;
};