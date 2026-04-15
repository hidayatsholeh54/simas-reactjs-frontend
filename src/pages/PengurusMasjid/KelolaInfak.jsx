import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchTransaksi,
  fetchPengeluaran,
  fetchKasMasjid,
  addTransaksi,
  addPengeluaran,
  deleteTransaksi,
  deletePengeluaran,
  updateTransaksi,
  updatePengeluaran
} from '../../features/keuangan/keuanganThunk';
import { clearMessages } from '../../features/keuangan/keuanganSlice';
import NavbarPengurus from './NavbarPengurus';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleExclamation,
  faMagnifyingGlass,
  faPlus,
  faPenToSquare,
  faTrash,
  faSpinner,
  faWallet,
  faArrowUp,
  faArrowDown,
  faMoneyBillWave,
  faCalendar,
  faFilter,
  faTimes,
  faCoins,
  faCreditCard,
  faUniversity,
  faQrcode
} from "@fortawesome/free-solid-svg-icons";

function KelolaInfak() {
  const dispatch = useDispatch();
  const { transaksi, pengeluaran, kas, loading, error, success } = useSelector((state) => state.keuangan);
  
  // Local state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('infak'); // 'infak' atau 'pengeluaran'
  const [editing, setEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [activeTab, setActiveTab] = useState('infak'); // 'infak' atau 'pengeluaran'
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    jenis_transaksi: 'infak',
    metode: 'tunai',
    nominal: '',
    keterangan: '',
    kategori: 'Operasional' // untuk pengeluaran
  });

  useEffect(() => {
    dispatch(fetchTransaksi());
    dispatch(fetchPengeluaran());
    dispatch(fetchKasMasjid());
  }, [dispatch]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        dispatch(clearMessages());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success, dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      tanggal: new Date().toISOString().split('T')[0],
      jenis_transaksi: 'infak',
      metode: 'tunai',
      nominal: '',
      keterangan: '',
      kategori: 'Operasional'
    });
    setEditing(false);
    setCurrentItem(null);
  };

  const handleAddInfak = () => {
    setModalType('infak');
    resetForm();
    setShowModal(true);
  };

  const handleAddPengeluaran = () => {
    setModalType('pengeluaran');
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (item, type) => {
    setModalType(type);
    setEditing(true);
    setCurrentItem(item);
    
    if (type === 'infak') {
      setFormData({
        tanggal: item.tanggal,
        jenis_transaksi: item.jenis_transaksi,
        metode: item.metode,
        nominal: item.nominal,
        keterangan: item.keterangan || '',
        kategori: 'Operasional'
      });
    } else {
      setFormData({
        tanggal: item.tanggal,
        nominal: item.nominal,
        keterangan: item.keterangan || '',
        kategori: item.kategori || 'Operasional',
        metode: 'tunai',
        jenis_transaksi: 'pengeluaran'
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Konversi nominal ke number
    const nominal = Number(formData.nominal);
    if (!nominal || nominal <= 0) {
      alert('Nominal harus diisi dan lebih dari 0');
      return;
    }

    // Update formData dengan nominal yang sudah di-number
    const dataToSubmit = {
      ...formData,
      nominal: nominal
    };

    console.log('Submit data:', dataToSubmit);

    try {
      if (modalType === 'infak') {
        if (editing) {
          console.log('Updating infak:', currentItem.id);
          await dispatch(updateTransaksi({
            id: currentItem.id,
            data: dataToSubmit,
            oldNominal: currentItem.nominal
          })).unwrap();
        } else {
          console.log('Adding new infak');
          await dispatch(addTransaksi(dataToSubmit)).unwrap();
        }
      } else {
        if (editing) {
          console.log('Updating pengeluaran:', currentItem.id);
          await dispatch(updatePengeluaran({
            id: currentItem.id,
            data: dataToSubmit,
            oldNominal: currentItem.nominal
          })).unwrap();
        } else {
          console.log('Adding new pengeluaran');
          await dispatch(addPengeluaran(dataToSubmit)).unwrap();
        }
      }
      
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error('Submit error:', err);
      alert('Error: ' + (err.message || 'Gagal menyimpan data'));
    }
  };

  const handleDelete = (id, type, nominal) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      if (type === 'infak') {
        dispatch(deleteTransaksi({ id, nominal }));
      } else {
        dispatch(deletePengeluaran({ id, nominal }));
      }
    }
  };

  // Filter functions
  const filterByDate = (items, dateField) => {
    return items.filter(item => {
      const itemDate = item[dateField];
      if (startDate && endDate) {
        return itemDate >= startDate && itemDate <= endDate;
      } else if (startDate) {
        return itemDate >= startDate;
      } else if (endDate) {
        return itemDate <= endDate;
      }
      return true;
    });
  };

  const filterBySearch = (items, searchFields) => {
    if (!searchTerm) return items;
    return items.filter(item => {
      return searchFields.some(field => 
        item[field]?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  };

  const filteredTransaksi = filterBySearch(
    filterByDate(transaksi, 'tanggal'),
    ['keterangan', 'metode']
  );

  const filteredPengeluaran = filterBySearch(
    filterByDate(pengeluaran, 'tanggal'),
    ['keterangan', 'kategori']
  );

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(angka);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarPengurus />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Kelola Keuangan Masjid
            </h1>
            <p className="text-gray-600">
              Kelola infak, donasi, dan pengeluaran masjid
            </p>
          </div>

          {/* Messages */}
          {success && (
            <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faCircleCheck} className="w-5 h-5 text-emerald-600 mr-2" />
                <p className="text-emerald-700">{success}</p>
              </div>
            </div>
          )}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faCircleExclamation} className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Kas Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Total Pemasukan */}
            <div className="bg-blue-600/90 backdrop-blur-sm rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 border border-white/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-blue-100 text-sm">Total Pemasukan</p>
                <FontAwesomeIcon icon={faArrowUp} className="text-blue-200 w-5 h-5" />
              </div>
              <p className="text-3xl font-bold drop-shadow-md">{kas ? formatRupiah(kas.total_pemasukan) : 'Rp 0'}</p>
            </div>

            {/* Total Pengeluaran */}
            <div className="bg-orange-600/90 backdrop-blur-sm rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 border border-white/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-orange-100 text-sm">Total Pengeluaran</p>
                <FontAwesomeIcon icon={faArrowDown} className="text-orange-200 w-5 h-5" />
              </div>
              <p className="text-3xl font-bold drop-shadow-md">{kas ? formatRupiah(kas.total_pengeluaran) : 'Rp 0'}</p>
            </div>

            {/* Saldo Akhir */}
            <div className="bg-emerald-600/90 backdrop-blur-sm rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 border border-white/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-emerald-100 text-sm">Saldo Akhir</p>
                <FontAwesomeIcon icon={faWallet} className="text-emerald-200 w-5 h-5" />
              </div>
              <p className="text-3xl font-bold drop-shadow-md">{kas ? formatRupiah(kas.saldo_akhir) : 'Rp 0'}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            <button
              onClick={handleAddInfak}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
              Tambah Infak/Donasi
            </button>
            <button
              onClick={handleAddPengeluaran}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-medium transition flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faMoneyBillWave} className="w-4 h-4" />
              Tambah Pengeluaran
            </button>
          </div>

          {/* Filter Section */}
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faMagnifyingGlass} className="w-3 h-3" />
                    <span>Cari</span>
                  </div>
                </label>
                <input
                  type="text"
                  placeholder="Cari keterangan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faCalendar} className="w-3 h-3" />
                    <span>Tanggal Mulai</span>
                  </div>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faCalendar} className="w-3 h-3" />
                    <span>Tanggal Selesai</span>
                  </div>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faFilter} className="w-4 h-4" />
                  Reset Filter
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('infak')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition flex items-center gap-2 ${
                  activeTab === 'infak'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FontAwesomeIcon icon={faCoins} className="w-4 h-4" />
                Infak & Donasi ({filteredTransaksi.length})
              </button>
              <button
                onClick={() => setActiveTab('pengeluaran')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition flex items-center gap-2 ${
                  activeTab === 'pengeluaran'
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FontAwesomeIcon icon={faMoneyBillWave} className="w-4 h-4" />
                Pengeluaran ({filteredPengeluaran.length})
              </button>
            </nav>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-12">
              <FontAwesomeIcon icon={faSpinner} className="h-12 w-12 text-blue-600 animate-spin" />
            </div>
          )}

          {/* Infak & Donasi Table */}
          {!loading && activeTab === 'infak' && (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jenis</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metode</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nominal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keterangan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTransaksi.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(item.tanggal)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.jenis_transaksi === 'infak' 
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {item.jenis_transaksi}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.metode === 'tunai' && <FontAwesomeIcon icon={faMoneyBillWave} className="w-3 h-3 mr-1 text-gray-500" />}
                          {item.metode === 'transfer' && <FontAwesomeIcon icon={faUniversity} className="w-3 h-3 mr-1 text-gray-500" />}
                          {item.metode === 'qris' && <FontAwesomeIcon icon={faQrcode} className="w-3 h-3 mr-1 text-gray-500" />}
                          {item.metode === 'e-wallet' && <FontAwesomeIcon icon={faCreditCard} className="w-3 h-3 mr-1 text-gray-500" />}
                          {item.metode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600">
                          {formatRupiah(item.nominal)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {item.keterangan || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(item, 'infak')}
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id, 'infak', item.nominal)}
                              className="text-red-600 hover:text-red-800"
                              title="Hapus"
                            >
                              <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredTransaksi.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                          Belum ada data infak/donasi
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pengeluaran Table */}
          {!loading && activeTab === 'pengeluaran' && (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nominal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keterangan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredPengeluaran.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(item.tanggal)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                            {item.kategori}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-600">
                          {formatRupiah(item.nominal)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {item.keterangan || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(item, 'pengeluaran')}
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id, 'pengeluaran', item.nominal)}
                              className="text-red-600 hover:text-red-800"
                              title="Hapus"
                            >
                              <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredPengeluaran.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                          Belum ada data pengeluaran
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal Tambah/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editing ? 'Edit' : 'Tambah'} {modalType === 'infak' ? 'Infak/Donasi' : 'Pengeluaran'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Tanggal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <div className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faCalendar} className="w-3 h-3" />
                        <span>Tanggal</span>
                      </div>
                    </label>
                    <input
                      type="date"
                      name="tanggal"
                      value={formData.tanggal}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      required
                    />
                  </div>

                  {/* Untuk Infak/Donasi */}
                  {modalType === 'infak' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Jenis Transaksi
                        </label>
                        <select
                          name="jenis_transaksi"
                          value={formData.jenis_transaksi}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                          <option value="infak">Infak</option>
                          <option value="donasi">Donasi</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Metode Pembayaran
                        </label>
                        <select
                          name="metode"
                          value={formData.metode}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                          <option value="tunai">Tunai</option>
                          <option value="transfer">Transfer Bank</option>
                          <option value="qris">QRIS</option>
                          <option value="e-wallet">E-Wallet</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* Untuk Pengeluaran */}
                  {modalType === 'pengeluaran' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kategori
                      </label>
                      <select
                        name="kategori"
                        value={formData.kategori}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="Operasional">Operasional</option>
                        <option value="Kegiatan">Kegiatan</option>
                        <option value="Perawatan">Perawatan</option>
                        <option value="Sosial">Sosial</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>
                  )}

                  {/* Nominal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <div className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faMoneyBillWave} className="w-3 h-3" />
                        <span>Nominal (Rp)</span>
                      </div>
                    </label>
                    <input
                      type="number"
                      name="nominal"
                      value={formData.nominal}
                      onChange={handleInputChange}
                      placeholder="Masukkan nominal"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      required
                    />
                  </div>

                  {/* Keterangan */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Keterangan
                    </label>
                    <textarea
                      name="keterangan"
                      value={formData.keterangan}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Masukkan keterangan (opsional)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    {editing ? 'Update' : 'Simpan'}
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

export default KelolaInfak;