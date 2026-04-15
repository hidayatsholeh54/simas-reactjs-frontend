// components/pengumuman/PengumumanAdmin.jsx
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchPengumuman,
  addPengumuman,
  updatePengumuman,
  deletePengumuman,
  togglePengumumanAktif
} from "../../features/pengumuman/pengumumanThunk";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NavbarPengurus from './NavbarPengurus';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSpinner,
  faPenToSquare,
  faTrash,
  faTimes,
  faBullhorn,
  faCalendarAlt,
  faClock,
  faCheckCircle,
  faFileAlt,
  faToggleOn,
  faToggleOff,
  faEye,
  faEyeSlash
} from "@fortawesome/free-solid-svg-icons";

function KelolaPengumuman() {
  const dispatch = useDispatch();
  const { pengumuman, loading } = useSelector((state) => state.pengumuman);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [currentPengumuman, setCurrentPengumuman] = useState(null);
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    waktu_selesai: '',
    is_aktif: true
  });

  useEffect(() => {
    dispatch(fetchPengumuman());
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };


const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!formData.judul || !formData.deskripsi) {
    toast.error('Judul dan deskripsi pengumuman harus diisi');
    return;
  }

  try {
    if (editing) {
      // Cek dulu apakah currentPengumuman ada dan punya id_pengumuman
      if (!currentPengumuman || !currentPengumuman.id) {
        console.error('Current pengumuman:', currentPengumuman);
        toast.error('Data pengumuman tidak valid');
        return;
      }

      console.log('Updating with id:', currentPengumuman.id); 
      
      await dispatch(updatePengumuman({
        id: currentPengumuman.id, 
        data: formData
      })).unwrap();
      
      toast.success('Pengumuman berhasil diperbarui');
    } else {
      await dispatch(addPengumuman(formData)).unwrap();
      toast.success('Pengumuman berhasil ditambahkan');
    }
    
    resetForm();
    setShowModal(false);
  } catch (error) {
    console.log('Error detail:', error);
    toast.error(error.message || 'Gagal menyimpan pengumuman');
  }
};

const handleEdit = (pengumuman) => {
  console.log('Editing pengumuman:', pengumuman); // Debug: lihat data yang diedit
  setCurrentPengumuman(pengumuman);
  setFormData({
    judul: pengumuman.judul || '',
    deskripsi: pengumuman.deskripsi || '',
    tanggal_mulai: pengumuman.tanggal_mulai || '',
    tanggal_selesai: pengumuman.tanggal_selesai || '',
    waktu_selesai: pengumuman.waktu_selesai || '',
    is_aktif: pengumuman.is_aktif
  });
  setEditing(true);
  setShowModal(true);
};

const handleDelete = async (id) => {
  if (window.confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) {
    try {
      await dispatch(deletePengumuman(id)).unwrap();
      toast.success('Pengumuman berhasil dihapus');
    } catch (error) {
      console.log('Error:', error);
      toast.error('Gagal menghapus pengumuman');
    }
  }
};

const handleToggleAktif = async (id, isAktif) => {
  try {
    await dispatch(togglePengumumanAktif({ id, is_aktif: !isAktif })).unwrap();
    toast.success(`Pengumuman ${!isAktif ? 'diaktifkan' : 'dinonaktifkan'}`);
  } catch (error) {
    console.log('Error:', error);
    toast.error('Gagal mengubah status pengumuman');
  }
};

  const resetForm = () => {
    setFormData({
      judul: '',
      deskripsi: '',
      tanggal_mulai: '',
      tanggal_selesai: '',
      waktu_selesai: '',
      is_aktif: true
    });
    setCurrentPengumuman(null);
    setEditing(false);
  };

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <NavbarPengurus />
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="container mx-auto px-4 pt-16">
        {/* Header */}
        <div className="bg-white rounded-xl shadow mb-8 p-6">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Kelola Pengumuman</h1>
              <p className="text-gray-600 mt-2">
                Buat dan kelola pengumuman untuk jamaah masjid
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section - tanpa bg white */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-700">Ringkasan Pengumuman</h2>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
              Tambah Pengumuman
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
              <FontAwesomeIcon icon={faBullhorn} className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {pengumuman?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Total Pengumuman</div>
              </div>
            </div>
            
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3">
              <FontAwesomeIcon icon={faEye} className="w-8 h-8 text-emerald-600" />
              <div>
                <div className="text-2xl font-bold text-emerald-600">
                  {pengumuman?.filter(p => p.is_aktif)?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Pengumuman Aktif</div>
              </div>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3">
              <FontAwesomeIcon icon={faEyeSlash} className="w-8 h-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {pengumuman?.filter(p => !p.is_aktif)?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Pengumuman Nonaktif</div>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <FontAwesomeIcon icon={faSpinner} className="h-12 w-12 text-blue-600 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Judul
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deskripsi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3" />
                        <span>Periode</span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faClock} className="w-3 h-3" />
                        <span>Waktu Selesai</span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pengumuman?.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleAktif(item.id, item.is_aktif)}
                          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                            item.is_aktif
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          <FontAwesomeIcon 
                            icon={item.is_aktif ? faToggleOn : faToggleOff} 
                            className="w-3 h-3" 
                          />
                          {item.is_aktif ? 'Aktif' : 'Nonaktif'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          <FontAwesomeIcon icon={faBullhorn} className="w-4 h-4 text-gray-400" />
                          {item.judul}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 truncate max-w-xs flex items-start gap-1">
                          <FontAwesomeIcon icon={faFileAlt} className="w-3 h-3 mt-1 text-gray-400" />
                          <span>{item.deskripsi}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(item.tanggal_mulai)}
                        </div>
                        <div className="text-xs text-gray-500">
                          s/d {formatDate(item.tanggal_selesai)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.waktu_selesai || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md flex items-center gap-1"
                            title="Edit"
                          >
                            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md flex items-center gap-1"
                            title="Hapus"
                          >
                            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                            <span className="hidden sm:inline">Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {(!pengumuman || pengumuman.length === 0) && (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          <FontAwesomeIcon icon={faBullhorn} className="w-16 h-16 text-gray-300 mb-4" />
                          <p className="text-lg">Belum ada pengumuman</p>
                          <p className="text-sm mt-2">Klik tombol "Tambah Pengumuman" untuk membuat yang pertama</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Tambah/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/5 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <FontAwesomeIcon icon={faBullhorn} className="w-6 h-6 text-emerald-600" />
                  {editing ? 'Edit Pengumuman' : 'Tambah Pengumuman'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <FontAwesomeIcon icon={faBullhorn} className="w-3 h-3 text-gray-500" />
                      Judul Pengumuman *
                    </label>
                    <input
                      type="text"
                      name="judul"
                      value={formData.judul}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Masukkan judul pengumuman"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <FontAwesomeIcon icon={faFileAlt} className="w-3 h-3 text-gray-500" />
                      Deskripsi *
                    </label>
                    <textarea
                      name="deskripsi"
                      value={formData.deskripsi}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Tulis deskripsi pengumuman di sini..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3 text-gray-500" />
                        Tanggal Mulai
                      </label>
                      <input
                        type="date"
                        name="tanggal_mulai"
                        value={formData.tanggal_mulai}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3 text-gray-500" />
                        Tanggal Selesai
                      </label>
                      <input
                        type="date"
                        name="tanggal_selesai"
                        value={formData.tanggal_selesai}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <FontAwesomeIcon icon={faClock} className="w-3 h-3 text-gray-500" />
                      Waktu Selesai
                    </label>
                    <input
                      type="time"
                      name="waktu_selesai"
                      value={formData.waktu_selesai}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_aktif"
                      name="is_aktif"
                      checked={formData.is_aktif}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_aktif" className="ml-2 text-sm text-gray-700 flex items-center gap-1">
                      <FontAwesomeIcon icon={formData.is_aktif ? faEye : faEyeSlash} className="w-3 h-3" />
                      Tampilkan pengumuman ini
                    </label>
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
                  >
                    <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-1"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4" />
                        {editing ? 'Update' : 'Simpan'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default KelolaPengumuman;