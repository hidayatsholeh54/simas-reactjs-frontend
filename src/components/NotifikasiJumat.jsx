import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { cekJadwalBesok, tandaiSudahDibaca } from '../features/notifikasi/notifikasiSlice';

const formatTanggal = (str) =>
  new Date(str).toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

export default function NotifikasiJumat() {
  const dispatch = useDispatch();
  const { adaJadwalBesok, jadwalBesok, sudahDibaca, loading } =
    useSelector((s) => s.notifikasi);

  // Cek otomatis saat komponen mount, lalu setiap 1 jam
  useEffect(() => {
    dispatch(cekJadwalBesok());
    const interval = setInterval(() => dispatch(cekJadwalBesok()), 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [dispatch]);

  if (!adaJadwalBesok || sudahDibaca || loading) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl mb-6 shadow-lg">
      <div className="absolute inset-0 from-emerald-600 via-emerald-500 to-teal-500" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24" />
      </div>

      <div className="relative px-6 py-5">
        {/* Header notifikasi */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Icon bergetar */}
            <div className="relative">
              <div className="absolute inset-0 bg-white/30 rounded-full animate-ping" />
              <div className="relative bg-white/20 backdrop-blur-sm rounded-full p-2.5">
                <span className="text-2xl">🕌</span>
              </div>
            </div>
            <div>
              <p className="text-white/80 text-xs font-medium uppercase tracking-widest">
                Pengingat Otomatis · H-1
              </p>
              <p className="text-white font-bold text-lg leading-tight">
                Sholat Jumat Besok
              </p>
            </div>
          </div>

          {/* Tombol tutup */}
          <button
            onClick={() => dispatch(tandaiSudahDibaca())}
            className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            aria-label="Tutup notifikasi"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Daftar jadwal besok */}
        <div className="space-y-3">
          {jadwalBesok.map((j, idx) => {
            const imam = j.detail_imam;
            const dbId = j.id ?? j.id_jadwal;
            return (
              <div
                key={dbId ?? idx}
                className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar inisial imam */}
                  <div className="w-12 h-12 rounded-full bg-white/25 flex items-center justify-center shrink-0 border-2 border-white/40">
                    <span className="text-white font-bold text-lg">
                      {(imam?.nama_imam || j.nama_imam || '?').charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-base truncate">
                      {imam?.nama_imam || j.nama_imam || '-'}
                    </p>
                    <p className="text-white/75 text-sm mt-0.5">
                      📅 {formatTanggal(j.tanggal_jumat)}
                    </p>
                    {imam?.keterangan && (
                      <span className="inline-block mt-1.5 bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                        {imam.keterangan}
                      </span>
                    )}
                  </div>

                  {/* Badge "Besok" */}
                  <div className="shrink-0">
                    <span className="bg-white text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                      BESOK
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-white/60 text-xs mt-4 text-center">
          Notifikasi ini muncul otomatis 1 hari sebelum Sholat Jumat dilaksanakan
        </p>
      </div>
    </div>
  );
}
