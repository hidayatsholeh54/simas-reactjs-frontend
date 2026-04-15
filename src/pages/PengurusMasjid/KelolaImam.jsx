// pages/PengurusMasjid/KelolaImam.jsx
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchImam, addImam, updateImam, deleteImam,
  fetchJadwal, generateJadwal, addJadwalManual, deleteJadwal,
  isiJadwalGagal,
} from '../../features/imam/imamThunk';
import { clearMessages, clearJadwalGagal } from '../../features/imam/imamSlice';
import { cekJadwalBesok } from '../../features/notifikasi/notifikasiSlice';
import NavbarPengurus from './NavbarPengurus';
import api from '../../services/api';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faMosque, faCheck } from "@fortawesome/free-solid-svg-icons";

const getJadwalId = (j) => j.id_jadwal ?? j.id;
const formatDate = (date) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const formatDateDisplay = (str) =>
  new Date(str).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
const hitungJumlahJumat = (tahun) => {
  const d = new Date(tahun, 0, 1); let c = 0;
  while (d.getFullYear() === tahun) { if (d.getDay() === 5) c++; d.setDate(d.getDate() + 1); }
  return c;
};
const getTodayStr = () => formatDate(new Date());
const getTomorrowStr = () => { const d = new Date(); d.setDate(d.getDate() + 1); return formatDate(d); };

// Alert jadwal yang gagal tersimpan 
function AlertJadwalGagal({ jadwalGagal, loadingRetry, onIsiOtomatis, onIsiManual, onDismiss }) {
  if (!jadwalGagal || jadwalGagal.length === 0) return null;
  return (
    <div className="mb-4 bg-orange-50 border border-orange-300 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">⚠️</span>
        <div className="flex-1">
          <p className="font-bold text-orange-800 text-sm">
            {jadwalGagal.length} jadwal gagal tersimpan saat generate
          </p>
          <p className="text-orange-700 text-xs mt-1">
            Penyebab: koneksi ke JSON Server sempat terputus (<code>ERR_SOCKET_NOT_CONNECTED</code>).
            Tanggal yang kosong:
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {jadwalGagal.map((j, i) => (
              <span key={i} className="bg-orange-100 border border-orange-300 text-orange-800 text-xs px-2 py-0.5 rounded-full font-mono">
                {j.tanggal_jumat}
              </span>
            ))}
          </div>
          <div className="mt-3 flex gap-2 flex-wrap">
            <button
              onClick={onIsiOtomatis}
              disabled={loadingRetry}
              className="bg-orange-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-orange-600 disabled:opacity-50 font-medium"
            >
              {loadingRetry ? '⏳ Mengisi...' : '🔄 Isi Otomatis (Retry)'}
            </button>
            <button
              onClick={onIsiManual}
              className="bg-white border border-orange-400 text-orange-700 text-xs px-3 py-1.5 rounded-lg hover:bg-orange-50 font-medium"
            >
              Isi Manual Satu per Satu
            </button>
            <button onClick={onDismiss} className="text-orange-400 hover:text-orange-600 text-xs ml-auto">
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal isi jadwal kosong manual
// Hanya tampilkan jadwal yang tanggalnya belum ada di db.json (tidak bisa duplikat)
function ModalIsiJadwalKosong({ jadwalGagal, imamList, jadwalExisting, onSimpan, onClose }) {
  // Cek duplikat: jadwal yang tanggalnya sudah ada di db.json tidak ditampilkan
  const belumAda = jadwalGagal.filter(
    j => !jadwalExisting.some(e => e.tanggal_jumat === j.tanggal_jumat)
  );
  const sudahAda = jadwalGagal.filter(
    j => jadwalExisting.some(e => e.tanggal_jumat === j.tanggal_jumat)
  );

  // State imam per jadwal (default: imam yang seharusnya berdasarkan round-robin)
  const [pilihanImam, setPilihanImam] = useState(() =>
    Object.fromEntries(belumAda.map(j => [j.tanggal_jumat, j.id_imam]))
  );
  const [saving, setSaving] = useState(false);

  const handleSimpanSemua = async () => {
    setSaving(true);
    const payload = belumAda.map(j => ({
      ...j,
      id_imam: pilihanImam[j.tanggal_jumat] || j.id_imam,
      nama_imam: imamList.find(i => i.id === Number(pilihanImam[j.tanggal_jumat] || j.id_imam))?.nama_imam || j.nama_imam,
    }));
    await onSimpan(payload);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b">
          <h3 className="text-lg font-bold text-gray-800">Isi Jadwal Kosong</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Jadwal di bawah belum tersimpan akibat koneksi terputus. Konfirmasi imam lalu simpan.
          </p>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-3">

          {/* Sudah ada di db.json — info saja */}
          {sudahAda.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-700">
              {sudahAda.length} tanggal sudah tersimpan sebelumnya (akan dilewati):
              {' '}{sudahAda.map(j => j.tanggal_jumat).join(', ')}
            </div>
          )}

          {/* Belum ada — bisa diisi */}
          {belumAda.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-3xl mb-2"><FontAwesomeIcon icon={faCheck} className="text-2xl" /></p>
              <p>Semua jadwal sudah tersimpan di database!</p>
            </div>
          ) : (
            belumAda.map((j, idx) => {
              const imamDefault = imamList.find(i => i.id === Number(pilihanImam[j.tanggal_jumat]));
              return (
                <div key={j.tanggal_jumat} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-orange-100 text-orange-700 text-xs font-mono px-2 py-0.5 rounded">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-gray-800 text-sm">
                      {formatDateDisplay(j.tanggal_jumat)}
                    </span>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Pilih Imam</label>
                    <select
                      value={pilihanImam[j.tanggal_jumat] || ''}
                      onChange={e => setPilihanImam(p => ({ ...p, [j.tanggal_jumat]: Number(e.target.value) }))}
                      className="w-full border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">-- Pilih imam --</option>
                      {imamList.map(im => (
                        <option key={im.id} value={im.id}>
                          {im.nama_imam}{im.keterangan ? ` — ${im.keterangan}` : ''}
                        </option>
                      ))}
                    </select>
                    {imamDefault && (
                      <p className="text-xs text-emerald-600 mt-1">
                        Kontak : {imamDefault.kontak || '-'}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t flex gap-3">
          <button onClick={onClose} className="flex-1 border py-2 rounded-lg hover:bg-gray-50 text-sm">
            Batal
          </button>
          {belumAda.length > 0 && (
            <button
              onClick={handleSimpanSemua}
              disabled={saving || belumAda.some(j => !pilihanImam[j.tanggal_jumat])}
              className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 text-sm disabled:opacity-50"
            >
              {saving ? ' Menyimpan...' : ` Simpan ${belumAda.length} Jadwal`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Komponen Utama
function KelolaImam() {
  const dispatch = useDispatch();
  const { imam, jadwal, jadwalGagal, loading, loadingRetry, error, success, statistikDistribusi } =
    useSelector((s) => s.imam);

  const [activeTab, setActiveTab] = useState('imam');
  const [showModal, setShowModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showEditJadwal, setShowEditJadwal] = useState(false);
  const [showIsiKosong, setShowIsiKosong] = useState(false);
  const [showStatistik, setShowStatistik] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingJadwal, setEditingJadwal] = useState(null);
  const [savingJadwal, setSavingJadwal] = useState(false);
  const [tahunGenerate, setTahunGenerate] = useState(new Date().getFullYear());
  const [filterTahun, setFilterTahun] = useState('semua');
  const [formData, setFormData] = useState({ nama_imam: '', kontak: '', keterangan: '' });
  const [manualData, setManualData] = useState({ tanggal_jumat: '', id_imam: '' });
  const [editJadwalForm, setEditJadwalForm] = useState({ tanggal_jumat: '', id_imam: '', nama_imam: '', status: 'terjadwal' });
  const [duplikatError, setDuplikatError] = useState(''); // error duplikat di modal manual

  const autoNotifRef = useRef(null);

  useEffect(() => { dispatch(fetchImam()); dispatch(fetchJadwal()); }, [dispatch]);

  useEffect(() => {
    const run = () => dispatch(cekJadwalBesok());
    run();
    autoNotifRef.current = setInterval(run, 60 * 60 * 1000);
    return () => clearInterval(autoNotifRef.current);
  }, [dispatch]);

  useEffect(() => {
    const t = setTimeout(() => dispatch(fetchJadwal()), 2500);
    return () => clearTimeout(t);
  }, [dispatch]);

  useEffect(() => {
    if (error || success) {
      const t = setTimeout(() => dispatch(clearMessages()), 6000);
      return () => clearTimeout(t);
    }
  }, [error, success, dispatch]);

  // Get Imam
  const getImamName = (id) => imam.find(i => i.id === id)?.nama_imam || '-';
  const tahunTersedia = [...new Set(jadwal.map(j => j.tahun))].sort();
  const besok = getTomorrowStr();
  const jadwalBesok = jadwal.filter(j => j.tanggal_jumat === besok);
  const jadwalFiltered = filterTahun === 'semua' ? jadwal : jadwal.filter(j => j.tahun === Number(filterTahun));
  const jadwalSorted = [...jadwalFiltered].sort((a, b) => new Date(a.tanggal_jumat) - new Date(b.tanggal_jumat));
  const statistikAktif = statistikDistribusi.length > 0
    ? statistikDistribusi
    : imam.map(im => ({ nama: im.nama_imam, jumlah: jadwalFiltered.filter(j => j.id_imam === im.id).length }));

  // Reset Imam
  const resetForm = () => { setFormData({ nama_imam: '', kontak: '', keterangan: '' }); setEditingId(null); };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) await dispatch(updateImam({ id: editingId, data: formData }));
    else await dispatch(addImam(formData));
    setShowModal(false); resetForm();
  };
  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({ nama_imam: item.nama_imam, kontak: item.kontak || '', keterangan: item.keterangan || '' });
    setShowModal(true);
  };
  const handleDelete = (id) => { if (window.confirm('Hapus imam ini?')) dispatch(deleteImam(id)); };

  // Generate
  const handleGenerateJadwal = async () => {
    if (imam.length === 0) { alert('Tambah imam dulu!'); return; }
    try {
      await dispatch(generateJadwal({ tahun: tahunGenerate })).unwrap();
      setShowGenerateModal(false);
      setShowStatistik(true);
    } catch (e) { console.error(e); }
  };

  // Tambah jadwal manual (cek duplikat)
  const handleTambahManual = async (e) => {
    e.preventDefault();
    setDuplikatError('');
    if (new Date(manualData.tanggal_jumat).getDay() !== 5) { alert('Bukan hari Jumat!'); return; }
    const result = await dispatch(addJadwalManual(manualData));
    if (result.meta.requestStatus === 'rejected') {
      setDuplikatError(result.payload); // tampilkan error duplikat di dalam modal
    } else {
      setShowManualModal(false);
      setManualData({ tanggal_jumat: '', id_imam: '' });
    }
  };

  // Retry otomatis jadwal gagal
  const handleIsiOtomatis = async () => {
    await dispatch(isiJadwalGagal({ jadwalGagalList: jadwalGagal }));
    dispatch(fetchJadwal());
  };

  // Isi jadwal kosong manual (dari modal)
  const handleIsiManualDariModal = async (payload) => {
    await dispatch(isiJadwalGagal({ jadwalGagalList: payload }));
    dispatch(fetchJadwal());
    setShowIsiKosong(false);
  };

  // Edit jadwal
  const handleOpenEditJadwal = (item) => {
    setEditingJadwal(item);
    setEditJadwalForm({
      tanggal_jumat: item.tanggal_jumat,
      id_imam: item.id_imam,
      nama_imam: item.nama_imam || getImamName(item.id_imam),
      status: item.status || 'terjadwal',
    });
    setShowEditJadwal(true);
  };
  const handleSaveEditJadwal = async (e) => {
    e.preventDefault();
    if (!editingJadwal) return;
    const im = imam.find(i => i.id === Number(editJadwalForm.id_imam));
    if (!im) { alert('Pilih imam'); return; }
    const dbId = editingJadwal.id ?? editingJadwal.id_jadwal;
    setSavingJadwal(true);
    try {
      await api.patch(`/jadwal_jumat/${dbId}`, {
        tanggal_jumat: editJadwalForm.tanggal_jumat,
        id_imam: im.id,
        nama_imam: im.nama_imam,
        status: editJadwalForm.status,
        tahun: new Date(editJadwalForm.tanggal_jumat).getFullYear(),
      });
      dispatch(fetchJadwal());
      setShowEditJadwal(false); setEditingJadwal(null);
    } catch (e) { alert('Gagal: ' + e.message); }
    finally { setSavingJadwal(false); }
  };

  const handleDeleteJadwal = (id) => { if (window.confirm('Hapus jadwal ini?')) dispatch(deleteJadwal(id)); };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarPengurus />

      {/* Modal isi jadwal kosong */}
      {showIsiKosong && (
        <ModalIsiJadwalKosong
          jadwalGagal={jadwalGagal}
          imamList={imam}
          jadwalExisting={jadwal}
          onSimpan={handleIsiManualDariModal}
          onClose={() => setShowIsiKosong(false)}
        />
      )}

      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">

          {/* Header ── */}
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-1">Imam & Jadwal Jumat</h1>
                <p className="text-gray-500">Kelola data imam dan jadwal sholat Jumat masjid</p>
              </div>
              {jadwalBesok.length > 0 && (
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <FontAwesomeIcon icon={faBell} className="text-2xl" />
                  <div>
                    <p className="text-amber-800 font-semibold text-sm">Jadwal Jumat Besok</p>
                    {jadwalBesok.map(j => (
                      <p key={getJadwalId(j)} className="text-amber-700 text-xs mt-0.5">
                        {getImamName(j.id_imam)} — {formatDateDisplay(j.tanggal_jumat)}
                      </p>
                    ))}
                    <p className="mt-1 text-xs">
                      {jadwalBesok.every(j => j.notifikasi_terkirim)
                        ? <span className="text-green-600 font-medium">Notifikasi terkirim</span>
                        : <span className="text-amber-600">Notifikasi diproses...</span>}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Alert jadwal gagal */}
          <AlertJadwalGagal
            jadwalGagal={jadwalGagal}
            imamList={imam}
            loadingRetry={loadingRetry}
            onIsiOtomatis={handleIsiOtomatis}
            onIsiManual={() => setShowIsiKosong(true)}
            onDismiss={() => dispatch(clearJadwalGagal())}
          />

          {/* Pesan */}
          {success && <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">{success}</div>}
          {error && !jadwalGagal.length && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">❌ {error}</div>
          )}

          {/* Statistik */}
          {showStatistik && statistikAktif.some(s => s.jumlah > 0) && (
            <div className="mb-6 bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-700">📊 Distribusi Jadwal Imam</h2>
                <button onClick={() => setShowStatistik(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {statistikAktif.map((s, i) => (
                  <div key={i} className="bg-emerald-50 rounded-lg p-3 text-center border border-emerald-100">
                    <p className="font-semibold text-emerald-800 text-sm truncate">{s.nama}</p>
                    <p className="text-3xl font-bold text-emerald-600 mt-1">{s.jumlah}</p>
                    <p className="text-xs text-gray-400">jadwal</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-400 text-center">selisih max 1 jadwal.</p>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow mb-6">
            <div className="flex border-b">
              {[{ key: 'imam', label: `Data Imam (${imam.length})` }, { key: 'jadwal', label: `Jadwal Jumat (${jadwal.length})` }]
                .map(tab => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 py-3 font-medium transition-colors ${activeTab === tab.key ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    {tab.label}
                  </button>
                ))}
            </div>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Memproses...</p>
            </div>
          )}

          {/* TAB IMAM */}
          {!loading && activeTab === 'imam' && (
            <>
              <div className="flex flex-wrap gap-3 mb-6">
                <button onClick={() => { resetForm(); setShowModal(true); }} className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">+ Tambah Imam</button>
                <button onClick={() => setShowGenerateModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">🔄 Generate Jadwal Tahunan</button>
                <button onClick={() => setShowStatistik(v => !v)} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">📊 Statistik</button>
              </div>
              <div className="bg-white rounded-xl shadow overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>{['No', 'Nama Imam', 'Kontak', 'Keterangan', 'Total Jadwal', 'Aksi'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {imam.map((item, i) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-400">{i + 1}</td>
                        <td className="px-6 py-4 font-semibold text-gray-800">{item.nama_imam}</td>
                        <td className="px-6 py-4 text-gray-600">{item.kontak || '-'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${item.keterangan?.toLowerCase().includes('tetap') ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                            {item.keterangan || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-emerald-600">{jadwal.filter(j => j.id_imam === item.id).length}</span>
                          <span className="text-gray-400 text-xs"> jadwal</span>
                        </td>
                        <td className="px-6 py-4 flex gap-2">
                          <button onClick={() => handleEdit(item)} className="text-blue-500 hover:text-blue-700">✏️</button>
                          <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700">🗑️</button>
                        </td>
                      </tr>
                    ))}
                    {imam.length === 0 && (
                      <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                        <div className="text-center">
                          <FontAwesomeIcon icon={faMosque} className="text-4xl mb-2 text-gray-400" />
                          <p>Belum ada imam.</p>
                        </div>
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ════ TAB JADWAL ════ */}
          {!loading && activeTab === 'jadwal' && (
            <>
              <div className="flex flex-wrap gap-3 mb-4 items-center">
                <button onClick={() => { setDuplikatError(''); setShowManualModal(true); }} className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">+ Tambah Manual</button>
                <button onClick={() => setShowGenerateModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">🔄 Generate Tahunan</button>
                {jadwalGagal.length > 0 && (
                  <button onClick={() => setShowIsiKosong(true)} className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 animate-pulse">
                    ⚠️ Isi {jadwalGagal.length} Jadwal Kosong
                  </button>
                )}
                <div className="ml-auto flex items-center gap-2">
                  <label className="text-sm text-gray-600">Filter:</label>
                  <select value={filterTahun} onChange={e => setFilterTahun(e.target.value)} className="border rounded-lg px-3 py-1.5 text-sm">
                    <option value="semua">Semua Tahun</option>
                    {tahunTersedia.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Total Jadwal', value: jadwalFiltered.length, color: 'blue' },
                  { label: 'Akan Datang', value: jadwalFiltered.filter(j => new Date(j.tanggal_jumat) >= new Date()).length, color: 'emerald' },
                  { label: 'Sudah Lewat', value: jadwalFiltered.filter(j => new Date(j.tanggal_jumat) < new Date()).length, color: 'gray' },
                  { label: 'Notif Terkirim', value: jadwalFiltered.filter(j => j.notifikasi_terkirim).length, color: 'purple' },
                ].map(info => (
                  <div key={info.label} className="bg-white rounded-xl shadow p-4 text-center">
                    <p className={`text-2xl font-bold text-${info.color}-600`}>{info.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{info.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-xl shadow overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>{['Tanggal Jumat', 'Imam', 'Status', 'Notifikasi', 'Aksi'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {jadwalSorted.map((item) => {
                      const id = getJadwalId(item);
                      const upcoming = new Date(item.tanggal_jumat) >= new Date();
                      const isBesok = item.tanggal_jumat === besok;
                      return (
                        <tr key={id} className={`hover:bg-gray-50 ${isBesok ? 'bg-amber-50 border-l-4 border-amber-400' : ''}`}>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-800">{isBesok && <span className="mr-1">⚠️</span>}{formatDateDisplay(item.tanggal_jumat)}</div>
                            <div className="text-xs text-gray-400">Tahun {item.tahun}</div>
                          </td>
                          <td className="px-6 py-4 font-medium">{getImamName(item.id_imam)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${upcoming ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {upcoming ? '🟢 Akan datang' : '⚫ Terlewat'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {item.notifikasi_terkirim
                              ? <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full font-medium">✅ Terkirim</span>
                              : <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">⏳ H-1 otomatis</span>
                            }
                          </td>
                          <td className="px-6 py-4 flex gap-2">
                            <button onClick={() => handleOpenEditJadwal(item)} className="text-blue-500 hover:text-blue-700">✏️</button>
                            <button onClick={() => handleDeleteJadwal(id)} className="text-red-500 hover:text-red-700">🗑️</button>
                          </td>
                        </tr>
                      );
                    })}
                    {jadwalSorted.length === 0 && (
                      <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                        <p className="text-4xl mb-2">📅</p>
                        <p>{filterTahun !== 'semua' ? `Belum ada jadwal tahun ${filterTahun}.` : 'Generate atau tambah manual!'}</p>
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>

      {/* ════ MODAL TAMBAH/EDIT IMAM ════ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-4">{editingId ? '✏️ Edit Imam' : '➕ Tambah Imam'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Imam *</label>
                <input type="text" name="nama_imam" value={formData.nama_imam} onChange={e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }))} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                <input type="text" name="kontak" value={formData.kontak} onChange={e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }))} placeholder="08xxxxxxxxx" className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                <select name="keterangan" value={formData.keterangan} onChange={e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }))} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500">
                  <option value="">-- Pilih --</option>
                  <option value="Imam Tetap">Imam Tetap</option>
                  <option value="Imam Cadangan">Imam Cadangan</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="flex-1 border py-2 rounded-lg hover:bg-gray-50">Batal</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700">{editingId ? 'Update' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════ MODAL TAMBAH MANUAL (dengan cek duplikat) ════ */}
      {showManualModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-1">➕ Tambah Jadwal Manual</h3>
            <p className="text-sm text-gray-400 mb-4">Tanggal yang sudah terdaftar tidak bisa ditambah duplikat.</p>

            {/* Error duplikat */}
            {duplikatError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {duplikatError}
              </div>
            )}

            <form onSubmit={handleTambahManual} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Jumat *</label>
                <input type="date" value={manualData.tanggal_jumat} min={getTodayStr()}
                  onChange={e => { setDuplikatError(''); setManualData(p => ({ ...p, tanggal_jumat: e.target.value })); }}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500" required />
                {manualData.tanggal_jumat && new Date(manualData.tanggal_jumat).getDay() !== 5 && (
                  <p className="text-red-500 text-xs mt-1">⚠️ Bukan hari Jumat!</p>
                )}
                {/* Cek real-time apakah tanggal sudah ada */}
                {manualData.tanggal_jumat && new Date(manualData.tanggal_jumat).getDay() === 5 && (() => {
                  const ada = jadwal.some(j => j.tanggal_jumat === manualData.tanggal_jumat);
                  return ada
                    ? <p className="text-orange-500 text-xs mt-1">⚠️ Tanggal ini sudah ada jadwalnya! Tidak bisa duplikat.</p>
                    : <p className="text-green-600 text-xs mt-1">✅ Tanggal tersedia, belum ada jadwal.</p>;
                })()}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Imam *</label>
                <select value={manualData.id_imam} onChange={e => setManualData(p => ({ ...p, id_imam: Number(e.target.value) }))} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500" required>
                  <option value="">-- Pilih imam --</option>
                  {imam.map(im => <option key={im.id} value={im.id}>{im.nama_imam}{im.keterangan ? ` — ${im.keterangan}` : ''}</option>)}
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => { setShowManualModal(false); setDuplikatError(''); }} className="flex-1 border py-2 rounded-lg hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={jadwal.some(j => j.tanggal_jumat === manualData.tanggal_jumat)}
                  className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════ MODAL EDIT JADWAL ════ */}
      {showEditJadwal && editingJadwal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-1">✏️ Edit Jadwal Jumat</h3>
            <p className="text-xs text-gray-400 mb-4 font-mono">ID: {editingJadwal.id ?? editingJadwal.id_jadwal}</p>
            <form onSubmit={handleSaveEditJadwal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Jumat *</label>
                <input type="date" value={editJadwalForm.tanggal_jumat}
                  onChange={e => setEditJadwalForm(p => ({ ...p, tanggal_jumat: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500" required />
                {editJadwalForm.tanggal_jumat && new Date(editJadwalForm.tanggal_jumat).getDay() !== 5 && (
                  <p className="text-amber-500 text-xs mt-1">⚠️ Bukan hari Jumat</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imam *</label>
                <select value={editJadwalForm.id_imam}
                  onChange={e => { const im = imam.find(i => i.id === Number(e.target.value)); setEditJadwalForm(p => ({ ...p, id_imam: im?.id || '', nama_imam: im?.nama_imam || '' })); }}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500" required>
                  <option value="">-- Pilih Imam --</option>
                  {imam.map(im => <option key={im.id} value={im.id}>{im.nama_imam}{im.keterangan ? ` — ${im.keterangan}` : ''}</option>)}
                </select>
                {editJadwalForm.id_imam && (() => {
                  const im = imam.find(i => i.id === Number(editJadwalForm.id_imam));
                  return im ? (
                    <div className="mt-2 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 text-xs">
                      <p className="font-semibold text-emerald-800">{im.nama_imam}</p>
                      <p className="text-emerald-600 mt-0.5">📞 {im.kontak || '-'}</p>
                    </div>
                  ) : null;
                })()}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={editJadwalForm.status} onChange={e => setEditJadwalForm(p => ({ ...p, status: e.target.value }))} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500">
                  <option value="terjadwal">Terjadwal</option>
                  <option value="selesai">Selesai</option>
                  <option value="dibatalkan">Dibatalkan</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowEditJadwal(false); setEditingJadwal(null); }} className="flex-1 border py-2 rounded-lg hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={savingJadwal} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                  {savingJadwal ? '⏳ Menyimpan...' : '💾 Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════ MODAL GENERATE ════ */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-2">🔄 Generate Jadwal Tahunan</h3>
            <p className="text-sm text-gray-500 mb-4">Distribusi round-robin, otomatis merata ke semua imam.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Tahun</label>
                <select value={tahunGenerate} onChange={e => setTahunGenerate(Number(e.target.value))} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500">
                  {[2024, 2025, 2026, 2027, 2028].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-sm space-y-1.5">
                <p className="font-semibold text-blue-800">📊 Preview</p>
                <p className="text-blue-700">Jumlah Jumat: <strong>{hitungJumlahJumat(tahunGenerate)} hari</strong></p>
                <p className="text-blue-700">Imam: <strong>{imam.length} orang</strong></p>
                {imam.length > 0 && <p className="text-blue-700">Per imam: <strong>{Math.floor(hitungJumlahJumat(tahunGenerate) / imam.length)}–{Math.ceil(hitungJumlahJumat(tahunGenerate) / imam.length)} jadwal</strong></p>}
                <p className="text-xs text-amber-600 pt-1">Jadwal lama tahun {tahunGenerate} akan dihapus.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowGenerateModal(false)} className="flex-1 border py-2 rounded-lg hover:bg-gray-50">Batal</button>
              <button onClick={handleGenerateJadwal} disabled={loading || imam.length === 0} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                {loading ? 'Memproses...' : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default KelolaImam;
