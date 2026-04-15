// pages/Jamaah/JadwalImamJamaah.jsx
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchJadwal, fetchImam } from '../../features/imam/imamThunk';
import NavbarJamaah from './NavbarJamaah';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faCalendarWeek,
  faSearch,
  faFilter,
  faTimes,
  faSpinner,
  faBell,
  faCheckCircle,
  faHourglassHalf,
  faMosque,
  faStar,
  faInfoCircle,
  
} from "@fortawesome/free-solid-svg-icons";

const formatDate = (d) => {
  const date = typeof d === 'string' ? new Date(d) : d;
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
};

const formatDisplay = (str) =>
  new Date(str).toLocaleDateString('id-ID', {
    weekday:'long', year:'numeric', month:'long', day:'numeric',
  });

const today    = () => formatDate(new Date());
const tomorrow = () => { const d=new Date(); d.setDate(d.getDate()+1); return formatDate(d); };

// Hitung berapa hari lagi dari sekarang
const hariLagi = (str) => {
  const diff = Math.round((new Date(str) - new Date()) / (1000*60*60*24));
  if (diff < 0) return null;
  if (diff === 0) return 'Hari ini';
  if (diff === 1) return 'Besok';
  return `${diff} hari lagi`;
};

// Komponen Hero Jadwal Berikutnya 
function HeroJadwalBerikutnya({ jadwal, imamList }) {
  if (!jadwal) return null;
  
  const imam = imamList.find(i => i.id === jadwal.id_imam);
  const countdown = hariLagi(jadwal.tanggal_jumat);
  const isBesok = jadwal.tanggal_jumat === tomorrow();

  return (
    <div className="relative overflow-hidden rounded-2xl mb-8 shadow-xl">
      {/* Background gradient masjid */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-800 via-emerald-700 to-teal-600" />
      
      {/* Lingkaran dekoratif */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-white/5 rounded-full" />

      <div className="relative px-6 py-7 md:px-10">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-teal-200 text-xs font-semibold uppercase tracking-widest mb-1 flex items-center gap-1">
              <FontAwesomeIcon icon={faMosque} className="w-3 h-3" />
              Jadwal Imam Berikutnya
            </p>
            <h2 className="text-white text-2xl md:text-3xl font-bold leading-tight mb-1">
              {formatDisplay(jadwal.tanggal_jumat)}
            </h2>
            <p className="text-teal-100 text-sm mb-5">Sholat Jumat Berjamaah</p>

            {/* Avatar + info imam */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="text-white text-2xl font-bold">
                  {(jadwal.nama_imam || '?').charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-white font-bold text-lg leading-tight">{jadwal.nama_imam || '-'}</p>
                {imam?.keterangan && (
                  <span className="inline-flex items-center gap-1 bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full mt-1">
                    <FontAwesomeIcon icon={faStar} className="w-3 h-3 text-yellow-300" />
                    {imam.keterangan}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Countdown badge */}
          <div className="text-right flex-shrink-0">
            <div className={`inline-block px-5 py-3 rounded-2xl text-center shadow-lg ${
              isBesok
                ? 'bg-amber-400 text-amber-900'
                : 'bg-white/20 backdrop-blur-sm border border-white/30 text-white'
            }`}>
              {isBesok && (
                <p className="text-xs font-semibold uppercase tracking-wide mb-0.5 flex items-center gap-1">
                  <FontAwesomeIcon icon={faBell} className="w-3 h-3" />
                  Besok!
                </p>
              )}
              <p className="text-3xl font-black leading-none">
                {countdown === 'Hari ini' || countdown === 'Besok'
                  ? countdown
                  : countdown?.replace(' hari lagi', '')}
              </p>
              {countdown !== 'Hari ini' && countdown !== 'Besok' && (
                <p className="text-xs mt-0.5 opacity-80">hari lagi</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabelJadwal({ jadwal, todayStr, tomorrowStr, getImamKet }) {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hari</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Imam</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keterangan</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {jadwal.map((j) => {
              const isToday = j.tanggal_jumat === todayStr;
              const isTomorrow = j.tanggal_jumat === tomorrowStr;
              const isLewat = new Date(j.tanggal_jumat) < new Date();
              const tanggal = new Date(j.tanggal_jumat);
              
              return (
                <tr key={j.id} className={`hover:bg-gray-50 ${isToday ? 'bg-emerald-50' : ''} ${isTomorrow ? 'bg-amber-50' : ''}`}>
                  <td className="px-4 py-3 text-sm">
                    {tanggal.toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {tanggal.toLocaleDateString('id-ID', { weekday:'long' })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        isToday ? 'bg-emerald-600 text-white' :
                        isTomorrow ? 'bg-amber-500 text-white' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {(j.nama_imam || '?').charAt(0)}
                      </div>
                      <span className="text-sm font-medium">{j.nama_imam || '-'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {getImamKet(j.id_imam) && (
                      <div className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faStar} className="w-3 h-3 text-yellow-500" />
                        {getImamKet(j.id_imam)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isToday && (
                      <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-xs px-2 py-1 rounded-full">
                        <FontAwesomeIcon icon={faCheckCircle} className="w-3 h-3" />
                        Hari ini
                      </span>
                    )}
                    {isTomorrow && (
                      <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                        <FontAwesomeIcon icon={faBell} className="w-3 h-3" />
                        Besok
                      </span>
                    )}
                    {!isToday && !isTomorrow && !isLewat && (
                      <span className="inline-flex items-center gap-1 bg-teal-100 text-teal-700 text-xs px-2 py-1 rounded-full">
                        <FontAwesomeIcon icon={faHourglassHalf} className="w-3 h-3" />
                        {hariLagi(j.tanggal_jumat)}
                      </span>
                    )}
                    {isLewat && !isToday && (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                        <FontAwesomeIcon icon={faCheckCircle} className="w-3 h-3" />
                        Selesai
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function JadwalImam() {
  const dispatch = useDispatch();
  const { jadwal, imam, loading } = useSelector(s => s.imam);

  const [filterTahun, setFilterTahun] = useState(new Date().getFullYear());
  const [filterBulan, setFilterBulan] = useState('semua');
  const [cariImam, setCariImam] = useState('');

  useEffect(() => {
    dispatch(fetchJadwal());
    dispatch(fetchImam());
  }, [dispatch]);

  const todayStr = today();
  const tomorrowStr = tomorrow();

  const getImamKet = (id) => imam.find(i => i.id === id)?.keterangan || '';

  // Filter jadwal
  const jadwalTahun = jadwal
    .filter(j => Number(j.tahun) === Number(filterTahun))
    .sort((a, b) => new Date(a.tanggal_jumat) - new Date(b.tanggal_jumat));

  const jadwalFiltered = jadwalTahun
    .filter(j => filterBulan === 'semua' || new Date(j.tanggal_jumat).getMonth() === Number(filterBulan))
    .filter(j => !cariImam || j.nama_imam?.toLowerCase().includes(cariImam.toLowerCase()));

  // Jadwal berikutnya (pertama yang belum lewat)
  const jadwalBerikutnya = jadwalTahun.find(j => new Date(j.tanggal_jumat) >= new Date());

  const tahunList = [...new Set(jadwal.map(j => j.tahun))].sort((a, b) => b - a);
  
  const bulanOptions = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  const totalJumat = jadwalTahun.length;
  const jadwalLewat = jadwalTahun.filter(j => new Date(j.tanggal_jumat) < new Date()).length;
  const jadwalDatang = jadwalTahun.filter(j => new Date(j.tanggal_jumat) >= new Date()).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarJamaah />
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          {loading && (
            <div className="text-center py-12">
              <FontAwesomeIcon icon={faSpinner} className="h-8 w-8 text-emerald-600 animate-spin" />
            </div>
          )}

          {!loading && (
            <>
              {/* Hero Jadwal Berikutnya */}
              {jadwalBerikutnya && (
                <HeroJadwalBerikutnya 
                  jadwal={jadwalBerikutnya} 
                  imamList={imam} 
                />
              )}

              {/* Statistik Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Jumat</p>
                      <p className="text-2xl font-bold text-gray-800">{totalJumat}</p>
                    </div>
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <FontAwesomeIcon icon={faCalendarWeek} className="text-xl text-emerald-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Sudah Lewat</p>
                      <p className="text-2xl font-bold text-gray-800">{jadwalLewat}</p>
                    </div>
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-xl text-gray-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Akan Datang</p>
                      <p className="text-2xl font-bold text-gray-800">{jadwalDatang}</p>
                    </div>
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <FontAwesomeIcon icon={faHourglassHalf} className="text-xl text-teal-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Filter */}
              <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <FontAwesomeIcon icon={faFilter} className="text-emerald-600" />
                  <h3 className="font-medium text-gray-700">Filter</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <select
                    value={filterTahun}
                    onChange={e => { setFilterTahun(Number(e.target.value)); setFilterBulan('semua'); }}
                    className="border rounded-lg px-3 py-2 text-sm bg-gray-50"
                  >
                    {tahunList.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>

                  <select
                    value={filterBulan}
                    onChange={e => setFilterBulan(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm bg-gray-50"
                  >
                    <option value="semua">Semua Bulan</option>
                    {bulanOptions.map((b, i) => <option key={i} value={i}>{b}</option>)}
                  </select>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Cari imam..."
                      value={cariImam}
                      onChange={e => setCariImam(e.target.value)}
                      className="w-full border rounded-lg pl-8 pr-8 py-2 text-sm bg-gray-50"
                    />
                    <FontAwesomeIcon icon={faSearch} className="w-3 h-3 text-gray-400 absolute left-2.5 top-3" />
                    {cariImam && (
                      <button
                        onClick={() => setCariImam('')}
                        className="absolute right-2 top-2.5"
                      >
                        <FontAwesomeIcon icon={faTimes} className="w-3 h-3 text-gray-400" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-right text-xs text-gray-500 mt-2">
                  {jadwalFiltered.length} jadwal ditemukan
                </div>
              </div>

              {/* Tabel */}
              {jadwalFiltered.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm py-12 text-center">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-4xl text-gray-300 mb-2" />
                  <p className="text-gray-500">Tidak ada jadwal</p>
                </div>
              ) : (
                <TabelJadwal 
                  jadwal={jadwalFiltered}
                  todayStr={todayStr}
                  tomorrowStr={tomorrowStr}
                  getImamKet={getImamKet}
                />
              )}

              {/* Footer */}
              <div className="flex items-center justify-center gap-1 mt-4 text-xs text-gray-400">
                <FontAwesomeIcon icon={faInfoCircle} className="w-3 h-3" />
                <span>Jadwal dapat berubah sewaktu-waktu</span>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}