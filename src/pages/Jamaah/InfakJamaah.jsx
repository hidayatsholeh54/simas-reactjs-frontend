// pages/Jamaah/InfakJamaah.jsx
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchKasMasjid, fetchTransaksi, fetchPengeluaran } from '../../features/keuangan/keuanganThunk';
import NavbarJamaah from './NavbarJamaah';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWallet,
  faUsers,
  faCoins,
  faMobileScreen,
  faQrcode,
  faMoneyBill,
  faFilter,
  faArrowUp,
  faArrowDown,
  faCheck,
  faCopy,
  faInfoCircle,
  faChartLine,
  faMoneyBillTrendUp,
  faReceipt,
  faBank,
  faMoneyBillTransfer,
  faMoneyBillWave
} from '@fortawesome/free-solid-svg-icons';

function InfakJamaah() {
  const dispatch = useDispatch();
  const { kas, transaksi, pengeluaran, loading } = useSelector((state) => state.keuangan);
  
  // Local state
  const [activeTab, setActiveTab] = useState('pemasukan');
  const [filterBulan, setFilterBulan] = useState('semua');
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');

  useEffect(() => {
    dispatch(fetchKasMasjid());
    dispatch(fetchTransaksi());
    dispatch(fetchPengeluaran());
  }, [dispatch]);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopyMessage(`${label} berhasil disalin!`);
    setShowCopyAlert(true);
    setTimeout(() => setShowCopyAlert(false), 2000);
  };

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

  // Filter berdasarkan bulan
  const filterByMonth = (items) => {
    if (filterBulan === 'semua') return items;
    
    const [tahun, bulan] = filterBulan.split('-');
    return items.filter(item => {
      const itemDate = new Date(item.tanggal);
      return itemDate.getFullYear() === parseInt(tahun) && 
             (itemDate.getMonth() + 1) === parseInt(bulan);
    });
  };

  const filteredTransaksi = filterByMonth(transaksi || []);
  const filteredPengeluaran = filterByMonth(pengeluaran || []);

  const totalPemasukanFilter = filteredTransaksi.reduce((sum, item) => sum + item.nominal, 0);
  const totalPengeluaranFilter = filteredPengeluaran.reduce((sum, item) => sum + item.nominal, 0);

  const getMetodeIcon = (metode) => {
    switch(metode) {
      case 'tunai': return faMoneyBillWave;
      case 'transfer': return faMoneyBillTransfer;
      case 'qris': return faQrcode;
      case 'e-wallet': return faMobileScreen;
      default: return faMoneyBill;
    }
  };

  const getJenisTransaksiClass = (jenis) => {
    return jenis === 'infak' 
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-blue-100 text-blue-700';
  };

  const getUniqueMonths = () => {
    // Gabungkan semua tanggal dari transaksi dan pengeluaran
    const semuaTanggal = [
      ...(transaksi?.map(t => t.tanggal) || []),
      ...(pengeluaran?.map(p => p.tanggal) || [])
    ].filter(Boolean); 
    
    // Buat Set untuk menghindari duplikasi bulan-tahun
    const bulanTahunSet = new Set();
    
    semuaTanggal.forEach(tanggal => {
      if (tanggal) {
        const date = new Date(tanggal);
        if (!isNaN(date.getTime())) {
          const tahun = date.getFullYear();
          const bulan = String(date.getMonth() + 1).padStart(2, '0');
          bulanTahunSet.add(`${tahun}-${bulan}`);
        }
      }
    });
    
    return Array.from(bulanTahunSet).sort().reverse();
  };

  const formatBulanTahun = (bulanTahun) => {
    const [tahun, bulan] = bulanTahun.split('-');
    const namaBulan = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${namaBulan[parseInt(bulan) - 1]} ${tahun}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarJamaah />
      
      {/* Copy Alert */}
      {showCopyAlert && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <FontAwesomeIcon icon={faCheck} className="text-white" />
          <span>{copyMessage}</span>
        </div>
      )}
      
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="inset-0 bg-linear-to-br from-teal-800 via-emerald-700 to-teal-600 rounded-xl shadow p-6 mb-6">
            <div className="text-center">
              <h1 className="text-3xl md:text-3xl font-bold text-white mb-3">
                Infak & Donasi
              </h1>
              <p className="text-lg md:text-xl text-white max-w-3xl mx-auto">
                Salurkan infak dan donasi Anda untuk kemakmuran masjid. 
                Setiap rupiah yang Anda berikan dikelola dengan transparan dan amanah.
              </p>
            </div>
          </div>

          {/* Kas Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-emerald-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                  <FontAwesomeIcon icon={faCoins} className="text-2xl" />
                </div>
                <p className="text-emerald-700 font-semibold text-lg">Total Terkumpul</p>
              </div>
              <p className="text-3xl md:text-4xl font-bold text-emerald-600">
                {kas ? formatRupiah(kas.total_pemasukan) : 'Rp 0'}
              </p>
            </div>

            <div className="bg-blue-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                  <FontAwesomeIcon icon={faUsers} className="text-2xl" />
                </div>
                <p className="text-blue-700 font-semibold text-lg">Total Donatur</p>
              </div>
              <p className="text-3xl md:text-4xl font-bold text-blue-600">
                {transaksi?.length || 0} <span className="text-xl">Orang</span>
              </p>
            </div>

            <div className="bg-purple-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                  <FontAwesomeIcon icon={faWallet} className="text-2xl" />
                </div>
                <p className="text-purple-700 font-semibold text-lg">Saldo Kas</p>
              </div>
              <p className="text-3xl md:text-4xl font-bold text-purple-600">
                {kas ? formatRupiah(kas.saldo_akhir) : 'Rp 0'}
              </p>
            </div>
          </div>

          {/* Metode Pembayaran */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Transfer Bank */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                  <FontAwesomeIcon icon={faBank} className="text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Transfer Bank</h3>
              </div>
              
              <div className="space-y-3 text-base">
                {[
                  { bank: 'BCA', nomor: '123 456 7890' },
                  { bank: 'Mandiri', nomor: '123-00-1234567-8' },
                  { bank: 'BRI', nomor: '1234-01-123456-7-8' }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-700 font-medium">{item.bank}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-gray-800">{item.nomor}</span>
                      <button
                        onClick={() => copyToClipboard(item.nomor, `Nomor rekening ${item.bank}`)}
                        className="text-gray-400 hover:text-emerald-600 transition"
                      >
                        <FontAwesomeIcon icon={faCopy} className="text-sm" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-200">
                <p className="text-gray-600 flex items-center gap-2 text-base">
                  <FontAwesomeIcon icon={faMobileScreen} className="text-emerald-600" />
                  Konfirmasi: <span className="font-semibold">0812-3456-7890</span>
                  <button
                    onClick={() => copyToClipboard('0812-3456-7890', 'Nomor WhatsApp')}
                    className="text-gray-400 hover:text-emerald-600 ml-1"
                  >
                    <FontAwesomeIcon icon={faCopy} className="text-sm" />
                  </button>
                </p>
                <p className="text-sm text-gray-500 mt-1">a.n. Masjid Al-Mubarok</p>
              </div>
            </div>

            {/* E-Wallet */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                  <FontAwesomeIcon icon={faMobileScreen} className="text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">E-Wallet</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: 'GoPay', nomor: '0812-3456-7890' },
                  { name: 'OVO', nomor: '0812-3456-7890' },
                  { name: 'DANA', nomor: '0812-3456-7890' }
                ].map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="font-bold text-gray-800 mb-1">{item.name}</div>
                    <div className="font-mono text-gray-700 text-sm mb-2">{item.nomor}</div>
                    <button
                      onClick={() => copyToClipboard(item.nomor, `Nomor ${item.name}`)}
                      className="text-emerald-600 hover:text-emerald-700 text-sm flex items-center justify-center gap-1"
                    >
                      <FontAwesomeIcon icon={faCopy} className="text-xs" />
                      <span>Salin</span>
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-200">
                <p className="text-base text-gray-600 flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheck} className="text-emerald-600 text-sm" />
                  a.n. Masjid Al-Mubarok
                </p>
              </div>
            </div>

            {/* QRIS */}
            <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                  <FontAwesomeIcon icon={faQrcode} className="text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">QRIS</h3>
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-48 h-48 from-emerald-50 to-emerald-100 rounded-xl flex flex-col items-center justify-center border-2 border-emerald-200">
                  <FontAwesomeIcon icon={faQrcode} className="text-8xl text-emerald-600 mb-2" />
                  <div className="text-center">
                    <div className="text-sm text-gray-700 font-medium">QRIS</div>
                    <div className="text-xs text-gray-500">Scan untuk donasi</div>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { text: 'Buka mobile banking', icon: faBank },
                      { text: 'Pilih menu Scan QR', icon: faQrcode },
                      { text: 'Scan kode QR', icon: faMobileScreen },
                      { text: 'Masukkan nominal', icon: faMoneyBill },
                      { text: 'Konfirmasi pembayaran', icon: faCheck }
                    ].map((step, index) => (
                      <div key={index} className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                        <span className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-sm">
                          {index + 1}
                        </span>
                        <FontAwesomeIcon icon={step.icon} className="text-emerald-600 text-sm" />
                        <span className="text-sm text-gray-700">{step.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tunai */}
            <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600">
                  <FontAwesomeIcon icon={faMoneyBillWave} className="text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Tunai</h3>
                  <p className="text-base text-gray-600">
                    Serahkan langsung di kotak infak yang tersedia di masjid
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Laporan Keuangan */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <FontAwesomeIcon icon={faChartLine} className="text-emerald-600" />
                  Laporan Keuangan
                </h2>
                <p className="text-base text-gray-600">
                  Data pemasukan dan pengeluaran masjid secara transparan
                </p>
              </div>
              
              {/* Filter Bulan */}
              <div className="mt-3 md:mt-0 flex items-center gap-2">
                <FontAwesomeIcon icon={faFilter} className="text-gray-400" />
                <select
                  value={filterBulan}
                  onChange={(e) => setFilterBulan(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
                >
                  <option value="semua">Semua Bulan</option>
                  {getUniqueMonths().map(bulanTahun => (
                    <option key={bulanTahun} value={bulanTahun}>
                      {formatBulanTahun(bulanTahun)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <FontAwesomeIcon icon={faArrowUp} className="text-emerald-600" />
                  <p className="text-emerald-700 font-medium text-sm">Pemasukan Periode Ini</p>
                </div>
                <p className="text-2xl font-bold text-emerald-600">{formatRupiah(totalPemasukanFilter)}</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <FontAwesomeIcon icon={faArrowDown} className="text-orange-600" />
                  <p className="text-orange-700 font-medium text-sm">Pengeluaran Periode Ini</p>
                </div>
                <p className="text-2xl font-bold text-orange-600">{formatRupiah(totalPengeluaranFilter)}</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <FontAwesomeIcon icon={faWallet} className="text-blue-600" />
                  <p className="text-blue-700 font-medium text-sm">Saldo Periode Ini</p>
                </div>
                <p className="text-2xl font-bold text-blue-600">{formatRupiah(totalPemasukanFilter - totalPengeluaranFilter)}</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-4">
              <nav className="flex space-x-6">
                <button
                  onClick={() => setActiveTab('pemasukan')}
                  className={`py-2 px-1 border-b-2 font-medium text-base transition flex items-center gap-2 ${
                    activeTab === 'pemasukan'
                      ? 'border-emerald-600 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FontAwesomeIcon icon={faMoneyBillTrendUp} />
                  Pemasukan ({filteredTransaksi.length})
                </button>
                <button
                  onClick={() => setActiveTab('pengeluaran')}
                  className={`py-2 px-1 border-b-2 font-medium text-base transition flex items-center gap-2 ${
                    activeTab === 'pengeluaran'
                      ? 'border-orange-600 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FontAwesomeIcon icon={faReceipt} />
                  Pengeluaran ({filteredPengeluaran.length})
                </button>
              </nav>
            </div>

            {/* Tabel Pemasukan */}
            {activeTab === 'pemasukan' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 uppercase">Tanggal</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 uppercase">Jenis</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 uppercase">Metode</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 uppercase">Nominal</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 uppercase">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransaksi.length > 0 ? (
                      filteredTransaksi.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-base text-gray-700">{formatDate(item.tanggal)}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getJenisTransaksiClass(item.jenis_transaksi)}`}>
                              {item.jenis_transaksi}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-base text-gray-700 capitalize flex items-center gap-2">
                            <FontAwesomeIcon icon={getMetodeIcon(item.metode)} className="text-gray-500" />
                            {item.metode}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap font-semibold text-base text-emerald-600">
                            {formatRupiah(item.nominal)}
                          </td>
                          <td className="px-4 py-3 text-base text-gray-600 max-w-xs truncate">
                            {item.keterangan || '-'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-gray-500 text-base">
                          <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
                          Belum ada data pemasukan
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tabel Pengeluaran */}
            {activeTab === 'pengeluaran' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 uppercase">Tanggal</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 uppercase">Kategori</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 uppercase">Nominal</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 uppercase">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPengeluaran.length > 0 ? (
                      filteredPengeluaran.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-base text-gray-700">{formatDate(item.tanggal)}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                              {item.kategori}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap font-semibold text-base text-orange-600">
                            {formatRupiah(item.nominal)}
                          </td>
                          <td className="px-4 py-3 text-base text-gray-600 max-w-xs truncate">
                            {item.keterangan || '-'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-4 py-8 text-center text-gray-500 text-base">
                          <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
                          Belum ada data pengeluaran
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="fixed inset-0 bg-white/50 flex justify-center items-center z-50">
              <div className="bg-white p-4 rounded-full shadow-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-200 border-t-emerald-600"></div>
              </div>
            </div>
          )}
        </div>
      </main>

    </div>
  );
}

export default InfakJamaah;