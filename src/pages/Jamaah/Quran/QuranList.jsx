import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAllSurat } from "../../../services/quranService";
import NavbarJamaah from "../NavbarJamaah";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

const QuranList = () => {
  const [surat, setSurat] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSurat = async () => {
      try {
        const data = await getAllSurat();
        setSurat(data?.data || []);
      } catch (err) {
        console.error("Gagal ambil surat:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSurat();
  }, []);

  // 🔥 Filter Aman (tidak akan error walau field undefined)
  const filteredSurat = useMemo(() => {
    if (!searchTerm) return surat;

    const keyword = searchTerm.toLowerCase();

    return surat.filter((item) => {
      const fields = [
        item?.name_id,
        item?.name_latin,
        item?.arti,
        item?.translation_id,
      ];

      return fields.some(
        (field) =>
          typeof field === "string" &&
          field.toLowerCase().includes(keyword)
      );
    });
  }, [searchTerm, surat]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <NavbarJamaah />
        <div className="flex justify-center items-center h-[80vh]">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-emerald-200 border-t-emerald-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-emerald-600 text-2xl">📖</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <NavbarJamaah />

      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
          
          {/* Header */}
          <div className="inset-0 bg-linear-to-br from-teal-800 via-emerald-700 to-teal-600 rounded-xl shadow p-6 mb-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2">
                Al-Qur'an Digital
              </h1>
              <p className="text-white max-w-2xl mx-auto">
                Bacalah Al-Qur'an dengan nyaman, dilengkapi terjemahan dan audio
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-xl shadow p-4 mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari surat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
              <span className="absolute left-3 top-3 text-gray-400"><FontAwesomeIcon icon={faMagnifyingGlass} className="w-3 h-3" /></span>

              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <p className="text-emerald-600 text-sm font-medium mb-1">Total Surat</p>
              <p className="text-2xl font-bold text-gray-800">{surat.length}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <p className="text-emerald-600 text-sm font-medium mb-1">Juz</p>
              <p className="text-2xl font-bold text-gray-800">30</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <p className="text-emerald-600 text-sm font-medium mb-1">Total Ayat</p>
              <p className="text-2xl font-bold text-gray-800">6.236</p>
            </div>
          </div>

          {/* Grid Surat */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSurat.map((item) => (
              <Link
                key={item.number}
                to={`/jamaah/quran/${item.number}`}
                className="group bg-emerald-50 border border-emerald-200 rounded-xl p-5 transition-all hover:shadow-lg hover:-translate-y-1 hover:bg-emerald-100"
              >
                <div className="flex items-start gap-4">
                  
                  {/* Nomor */}
                  <div className="w-12 h-12 bg-emerald-200 text-emerald-700 rounded-lg flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
                    {item.number}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-emerald-700 transition-colors">
                      {item.name_id || item.name_latin}
                    </h3>

                    <div className="flex gap-3 mt-3">
                      <span className="px-3 py-1 bg-white/60 rounded-full text-xs text-emerald-700 font-medium">
                        {item.number_of_verses} Ayat
                      </span>

                      <span className="px-3 py-1 bg-white/60 rounded-full text-xs text-emerald-700 font-medium">
                        {item.revelation_id}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Empty State */}
          {filteredSurat.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">😕</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Surat tidak ditemukan
              </h3>
              <p className="text-gray-500">
                Coba gunakan kata kunci yang berbeda
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default QuranList;