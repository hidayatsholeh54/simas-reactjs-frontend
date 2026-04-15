// pages/Jamaah/Quran/QuranDetail.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSuratDetail, getAyatRange } from "../../../services/quranService";
import NavbarJamaah from "../NavbarJamaah";

const QuranDetail = () => {
  const { number } = useParams();
  const [surat, setSurat] = useState(null);
  const [ayat, setAyat] = useState([]);
  const [start, setStart] = useState(1);
  const [end, setEnd] = useState(10);
  const [loading, setLoading] = useState(true);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [activeAyah, setActiveAyah] = useState(null);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const detail = await getSuratDetail(number);
        setSurat(detail.data);

        const ayatData = await getAyatRange(number, start, end);
        setAyat(ayatData.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [number, start, end]);

  const nextPage = () => {
    if (end < surat.number_of_verses) {
      setStart((prev) => prev + 10);
      setEnd((prev) =>
        prev + 10 > surat.number_of_verses ? surat.number_of_verses : prev + 10
      );
    } else if (Number(number) < 114) {
      navigate(`/jamaah/quran/${Number(number) + 1}`);
      setStart(1);
      setEnd(10);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prevPage = () => {
    if (start > 1) {
      setStart((prev) => prev - 10);
      setEnd((prev) => prev - 10);
    } else if (Number(number) > 1) {
      navigate(`/jamaah/quran/${Number(number) - 1}`);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const playAudio = (url, ayahNumber) => {
    if (playingAudio === url) {
      audioRef.current.pause();
      setPlayingAudio(null);
      setActiveAyah(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setPlayingAudio(url);
        setActiveAyah(ayahNumber);
      }
    }
  };

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

  if (!surat) return null;

  return (
    <div className="min-h-screen bg-white">
      <NavbarJamaah />
      
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Header Surat */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <button
                onClick={() => navigate('/jamaah/quran')}
                className="mb-4 md:mb-0 flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition"
              >
                <span>←</span> Daftar Surat
              </button>
              
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {surat.name_id}
                </h1>
                <p className="text-gray-500 mb-3">{surat.arti}</p>
                <div className="flex items-center justify-center gap-4 text-sm">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                    {surat.number_of_verses} Ayat
                  </span>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                    {surat.revelation_id}
                  </span>
                </div>
              </div>

              <div className="text-3xl font-arabic text-emerald-600 mt-4 md:mt-0">
                {surat.name}
              </div>
            </div>
          </div>

          {/* Navigation Info */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-gray-500">
              Menampilkan ayat {start} - {Math.min(end, surat.number_of_verses)}
            </div>
            <div className="flex gap-2">
              <button
                onClick={prevPage}
                disabled={start === 1 && Number(number) === 1}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  start === 1 && Number(number) === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-emerald-500 hover:text-emerald-600 shadow-sm'
                }`}
              >
                ← Sebelumnya
              </button>
              <button
                onClick={nextPage}
                disabled={end >= surat.number_of_verses && Number(number) === 114}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  end >= surat.number_of_verses && Number(number) === 114
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-emerald-500 hover:text-emerald-600 shadow-sm'
                }`}
              >
                Berikutnya →
              </button>
            </div>
          </div>

          {/* Ayat List - Warna Hijau Semua */}
          <div className="space-y-4">
            {ayat.map((item) => {
              const isActive = activeAyah === item.ayah;
              
              return (
                <div
                  key={item.id}
                  className={`bg-emerald-50 border border-emerald-200 rounded-xl p-6 transition-all ${
                    isActive 
                      ? 'ring-2 ring-emerald-500 shadow-lg scale-[1.02] bg-emerald-100' 
                      : 'hover:shadow-md hover:bg-emerald-100'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Nomor Ayat */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                      isActive 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-emerald-200 text-emerald-700'
                    }`}>
                      {item.ayah}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      {/* Arabic Text & Audio Button */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 text-right">
                          <p className={`font-arabic text-2xl leading-loose ${
                            isActive ? 'text-emerald-700' : 'text-gray-800'
                          }`}>
                            {item.arab}
                          </p>
                        </div>
                        <button
                          onClick={() => playAudio(item.audio, item.ayah)}
                          className={`ml-4 w-10 h-10 rounded-full flex items-center justify-center transition shadow-sm ${
                            playingAudio === item.audio
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-emerald-200 text-emerald-700 hover:bg-emerald-300'
                          }`}
                        >
                          {playingAudio === item.audio ? '⏸️' : '▶️'}
                        </button>
                      </div>

                      {/* Transliteration */}
                      {item.latin && (
                        <p className="text-emerald-700 italic text-sm mb-3 border-l-4 border-emerald-300 pl-3">
                          {item.latin}
                        </p>
                      )}

                      {/* Translation */}
                      <p className="text-gray-700 leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Navigation */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={prevPage}
              disabled={start === 1 && Number(number) === 1}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                start === 1 && Number(number) === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-emerald-500 hover:text-emerald-600 shadow-sm'
              }`}
            >
              ← Halaman Sebelumnya
            </button>
            
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">Halaman</div>
              <div className="text-lg font-semibold text-emerald-600">
                {Math.ceil(start / 10)} / {Math.ceil(surat.number_of_verses / 10)}
              </div>
            </div>

            <button
              onClick={nextPage}
              disabled={end >= surat.number_of_verses && Number(number) === 114}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                end >= surat.number_of_verses && Number(number) === 114
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-emerald-500 hover:text-emerald-600 shadow-sm'
              }`}
            >
              Halaman Berikutnya →
            </button>
          </div>

          {/* Audio Player */}
          <audio ref={audioRef} onEnded={() => {
            setPlayingAudio(null);
            setActiveAyah(null);
          }} />
        </div>
      </main>
    </div>
  );
};

export default QuranDetail;