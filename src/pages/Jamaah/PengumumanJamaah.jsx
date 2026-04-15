// pages/Jamaah/PengumumanJamaah.jsx
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPengumuman } from '../../features/pengumuman/pengumumanThunk';
import NavbarJamaah from './NavbarJamaah';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBullhorn,
  faMagnifyingGlass,
  faTimes,
  faSpinner,
  faCalendarAlt,
  faClock,
  faArrowRight,
  faInfoCircle,
  faFilter,
  faBell
} from "@fortawesome/free-solid-svg-icons";

function PengumumanJamaah() {
  const dispatch = useDispatch();
  const { pengumuman, loading } = useSelector((state) => state.pengumuman);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPengumuman, setSelectedPengumuman] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(fetchPengumuman());
  }, [dispatch]);

  // Filter hanya pengumuman aktif dan berdasarkan search
  const activePengumuman = pengumuman?.filter(item => item.is_aktif === true) || [];
  
  const filteredPengumuman = activePengumuman.filter(item => {
    return item.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
           item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
        console.log(error)
      return '-';
    }
  };

  const openDetail = (item) => {
    setSelectedPengumuman(item);
    setShowModal(true);
  };

  const closeDetail = () => {
    setSelectedPengumuman(null);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarJamaah />
      
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Header Card */}
          <div className="inset-0 bg-linear-to-br from-teal-800 via-emerald-700 to-teal-600 rounded-xl shadow p-6 mb-6">
              <div className='text-center'>
                <h1 className="text-3xl font-bold text-white mb-1">Pengumuman</h1>
                <p className="text-white">
                  Informasi terbaru dan pengumuman penting dari pengurus masjid untuk seluruh jamaah
                </p>
              </div>
          </div>

          {/* Filter Section - tanpa bg-white */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <FontAwesomeIcon icon={faFilter} className="text-emerald-600 w-4 h-4" />
              <h2 className="text-sm font-medium text-gray-600">Filter Pengumuman</h2>
            </div>
            
            <div className="relative max-w-xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="text-gray-400 w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Cari judul atau deskripsi pengumuman..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-12 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-300 text-gray-700 placeholder-gray-400 shadow-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2 w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {!loading && filteredPengumuman.length > 0 && (
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <FontAwesomeIcon icon={faInfoCircle} className="w-3 h-3" />
                Menampilkan {filteredPengumuman.length} pengumuman
              </p>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <FontAwesomeIcon icon={faSpinner} className="h-16 w-16 text-emerald-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <FontAwesomeIcon icon={faBullhorn} className="text-2xl text-emerald-400" />
                </div>
              </div>
              <p className="text-gray-600 mt-6 text-lg">Memuat pengumuman...</p>
            </div>
          )}

          {/* Grid Pengumuman */}
          {!loading && (
            <>
              {filteredPengumuman.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPengumuman.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => openDetail(item)}
                      className="group bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 overflow-hidden border border-gray-100"
                    >
                      <div className="p-6">
                        {/* Icon dan Status */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FontAwesomeIcon icon={faBullhorn} className="text-2xl text-emerald-600" />
                          </div>
                          <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <FontAwesomeIcon icon={faBell} className="w-3 h-3" />
                            Aktif
                          </span>
                        </div>

                        {/* Judul */}
                        <h2 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                          {item.judul}
                        </h2>

                        {/* Deskripsi Preview */}
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {item.deskripsi}
                        </p>

                        {/* Tanggal */}
                        <div className="flex items-center gap-2 text-sm text-gray-500 border-t pt-4">
                          <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4 text-gray-400" />
                          <span>
                            {item.tanggal_mulai ? formatDate(item.tanggal_mulai) : 'Segera'}
                            {item.tanggal_selesai && ` - ${formatDate(item.tanggal_selesai)}`}
                          </span>
                        </div>

                        {/* Read More Indicator */}
                        <div className="mt-4 text-emerald-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          Klik untuk detail
                          <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-xl shadow">
                  <div className="relative inline-block">
                    <FontAwesomeIcon icon={faBullhorn} className="text-7xl text-gray-300 mb-4" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {searchTerm ? 'Pengumuman Tidak Ditemukan' : 'Belum Ada Pengumuman'}
                  </h3>
                  <p className="text-gray-500 text-lg max-w-md mx-auto">
                    {searchTerm
                      ? `Tidak ada pengumuman yang cocok dengan "${searchTerm}"`
                      : 'Pengurus masjid belum mempublikasikan pengumuman apapun'}
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="mt-6 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium inline-flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                      Reset Pencarian
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Modal Detail Pengumuman */}
      {showModal && selectedPengumuman && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={closeDetail}
        >
          <div 
            className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <FontAwesomeIcon icon={faBullhorn} className="text-emerald-600 w-6 h-6" />
                  Detail Pengumuman
                </h2>
                <button
                  onClick={closeDetail}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content Modal */}
            <div className="p-6">
              {/* Judul */}
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {selectedPengumuman.judul}
              </h3>

              {/* Info Tanggal */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedPengumuman.tanggal_mulai && (
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faCalendarAlt} className="text-emerald-600 w-4 h-4" />
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Tanggal Mulai</p>
                        <p className="font-medium text-gray-800">
                          {formatDate(selectedPengumuman.tanggal_mulai)}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedPengumuman.tanggal_selesai && (
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faCalendarAlt} className="text-emerald-600 w-4 h-4" />
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Tanggal Selesai</p>
                        <p className="font-medium text-gray-800">
                          {formatDate(selectedPengumuman.tanggal_selesai)}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedPengumuman.waktu_selesai && (
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faClock} className="text-emerald-600 w-4 h-4" />
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Waktu Selesai</p>
                        <p className="font-medium text-gray-800">
                          {selectedPengumuman.waktu_selesai}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Deskripsi Lengkap */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FontAwesomeIcon icon={faInfoCircle} className="text-emerald-600 w-4 h-4" />
                  Deskripsi
                </h4>
                <div className="text-gray-600 whitespace-pre-line bg-gray-50 rounded-lg p-4">
                  {selectedPengumuman.deskripsi}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PengumumanJamaah;