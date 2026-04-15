// pages/Jamaah/JadwalSholat.jsx
import React, { useEffect, useState } from "react";
import NavbarJamaah from "./NavbarJamaah";
import { getJadwalSholat, getAllKota } from "../../services/quranService";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSun, 
  faCloudSun, 
  faMoon, 
  faCity, 
  faCalendarAlt,
  faLocationDot,
  faClock,
  faCloud,
} from '@fortawesome/free-solid-svg-icons';

const DEFAULT_KOTA = "1505";

const JadwalSholat = () => {
  const [kotaList, setKotaList] = useState([]);
  const [selectedKota, setSelectedKota] = useState(DEFAULT_KOTA);
  const [jadwal, setJadwal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedKotaName, setSelectedKotaName] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const todayDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Ambil daftar kota
  useEffect(() => {
    const fetchKota = async () => {
      try {
        const data = await getAllKota();
        setKotaList(data.data);
        
        // Set nama kota default
        const defaultKota = data.data.find(k => k.id === DEFAULT_KOTA);
        if (defaultKota) {
          setSelectedKotaName(defaultKota.lokasi);
        }
      } catch (err) {
        console.error("Gagal ambil kota:", err);
      }
    };

    fetchKota();
  }, []);

  // Update nama kota ketika selectedKota berubah
  useEffect(() => {
    const kota = kotaList.find(k => k.id === selectedKota);
    if (kota) {
      setSelectedKotaName(kota.lokasi);
    }
  }, [selectedKota, kotaList]);

  // Ambil jadwal ketika kota berubah
  useEffect(() => {
    if (!selectedKota) return;

    const fetchJadwal = async () => {
      setLoading(true);
      try {
        const data = await getJadwalSholat(selectedKota, today);
        setJadwal(data.data.jadwal);
      } catch (err) {
        console.error("Gagal ambil jadwal:", err);
      }
      setLoading(false);
    };

    fetchJadwal();
  }, [selectedKota, today]);

  const waktuList = jadwal
    ? [
        { 
          label: "Subuh", 
          value: jadwal.subuh, 
          icon: faSun,
          bgColor: "bg-blue-50", 
          borderColor: "border-blue-200", 
          textColor: "text-blue-600",
          iconBg: "bg-blue-100"
        },
        { 
          label: "Dzuhur", 
          value: jadwal.dzuhur, 
          icon: faSun,
          bgColor: "bg-amber-50", 
          borderColor: "border-amber-200", 
          textColor: "text-amber-600",
          iconBg: "bg-amber-100"
        },
        { 
          label: "Ashar", 
          value: jadwal.ashar, 
          icon: faCloudSun,
          bgColor: "bg-orange-50", 
          borderColor: "border-orange-200", 
          textColor: "text-orange-600",
          iconBg: "bg-orange-100"
        },
        { 
          label: "Maghrib", 
          value: jadwal.maghrib, 
          icon: faCloudSun, 
          bgColor: "bg-rose-50", 
          borderColor: "border-rose-200", 
          textColor: "text-rose-600",
          iconBg: "bg-rose-100"
        },
        { 
          label: "Isya", 
          value: jadwal.isya, 
          icon: faMoon,
          bgColor: "bg-purple-50", 
          borderColor: "border-purple-200", 
          textColor: "text-purple-600",
          iconBg: "bg-purple-100"
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-white">
      <NavbarJamaah />
      
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="inset-0 bg-linear-to-br from-teal-800 via-emerald-700 to-teal-600 rounded-xl shadow p-6 mb-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2">
                Jadwal Sholat
              </h1>
              <p className="text-white max-w-2xl mx-auto">
                Waktu sholat untuk wilayah Anda hari ini
              </p>
            </div>
          </div>

          {/* Pilih Kota Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                <FontAwesomeIcon icon={faCity} className="text-xl" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Pilih Kota / Kabupaten</h2>
            </div>
            
            <select
              value={selectedKota}
              onChange={(e) => setSelectedKota(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
            >
              <option value="">-- Pilih Kota --</option>
              {kotaList.map((kota) => (
                <option key={kota.id} value={kota.id}>
                  {kota.lokasi}
                </option>
              ))}
            </select>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
            </div>
          )}

          {/* Jadwal Sholat */}
          {jadwal && !loading && (
            <>
              {/* Info Tanggal & Lokasi */}
              <div className=" from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-6 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-200 rounded-full flex items-center justify-center text-emerald-700">
                      <FontAwesomeIcon icon={faLocationDot} className="text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-emerald-600 font-medium">Lokasi</p>
                      <h3 className="text-xl font-bold text-gray-800">{selectedKotaName}</h3>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-200 rounded-full flex items-center justify-center text-emerald-700">
                      <FontAwesomeIcon icon={faCalendarAlt} className="text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-emerald-600 font-medium">Tanggal</p>
                      <h3 className="text-lg font-semibold text-gray-800">{todayDate}</h3>
                      <p className="text-sm text-emerald-600">{jadwal.tanggal}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid Waktu Sholat */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Imsak */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                      <FontAwesomeIcon icon={faClock} className="text-lg" />
                    </div>
                    <h3 className="font-semibold text-gray-700">Imsak</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{jadwal.imsak}</p>
                </div>

                {/* Waktu Sholat Utama */}
                {waktuList.map((item, index) => (
                  <div
                    key={index}
                    className={`${item.bgColor} border ${item.borderColor} rounded-xl p-5 hover:shadow-lg transition-all hover:-translate-y-1`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 ${item.iconBg} rounded-lg flex items-center justify-center ${item.textColor}`}>
                        <FontAwesomeIcon icon={item.icon} className="text-lg" />
                      </div>
                      <h3 className={`font-semibold ${item.textColor}`}>{item.label}</h3>
                    </div>
                    <p className={`text-3xl font-bold ${item.textColor}`}>{item.value}</p>
                  </div>
                ))}

                {/* Terbit */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                      <FontAwesomeIcon icon={faCloud} className="text-lg" />
                    </div>
                    <h3 className="font-semibold text-amber-600">Terbit</h3>
                  </div>
                  <p className="text-2xl font-bold text-amber-600">{jadwal.terbit}</p>
                </div>

                {/* Dhuha */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                      <FontAwesomeIcon icon={faSun} className="text-lg" />
                    </div>
                    <h3 className="font-semibold text-emerald-600">Dhuha</h3>
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">{jadwal.dhuha}</p>
                </div>
              </div>

              {/* Footer Info */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Data diperbarui: {todayDate}
                </p>
              </div>
            </>
          )}

          {!jadwal && !loading && selectedKota && (
            <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
              <div className="text-6xl mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Tidak ada jadwal
              </h3>
              <p className="text-gray-500">
                Silakan pilih kota terlebih dahulu
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default JadwalSholat;