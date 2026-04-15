import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { 
  fetchUsers, 
  addUser, 
  updateUser, 
  deleteUser,
  toggleUserStatus
} from "../../features/users/userThunk";
import NavbarPengurus from "./NavbarPengurus";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleExclamation,
  faMagnifyingGlass,
  faPlus,
  faPenToSquare,
  faTrash,
  faToggleOn,
  faToggleOff,
  faTimes,
  faSpinner,
  faUsers,
  faUserTie,
  faUser
} from "@fortawesome/free-solid-svg-icons";

function KelolaUsers() {
  const dispatch = useDispatch();
  const { users, loading, error, success } = useSelector((state) => state.users);

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    nama: "",
    role: "jamaah",
    kontak: "",
    alamat: "",
    status: "aktif"
  });

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Filter users
  const jamaahUsers = users.filter((u) => u.role === "jamaah");
  const pengurusUsers = users.filter((u) => u.role === "pengurus");
  
  const filteredJamaah = jamaahUsers.filter(user =>
    user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.kontak.includes(searchTerm)
  );
  
  const filteredPengurus = pengurusUsers.filter(user =>
    user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.kontak.includes(searchTerm)
  );

  // Handlers
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editingId) {
      // Update existing user
      await dispatch(updateUser({ id: editingId, data: formData }));
    } else {
      // Add new user
      await dispatch(addUser(formData));
    }
    
    setShowModal(false);
    resetForm();
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setFormData({
      username: user.username,
      password: "", // Kosongkan password saat edit (tidak ditampilkan)
      nama: user.nama,
      role: user.role,
      kontak: user.kontak || "",
      alamat: user.alamat || "",
      status: user.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus user ini?")) {
      await dispatch(deleteUser(id));
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    await dispatch(toggleUserStatus({ id, currentStatus }));
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      username: "",
      password: "",
      nama: "",
      role: "jamaah",
      kontak: "",
      alamat: "",
      status: "aktif"
    });
  };

  const handleAddNew = () => {
    resetForm();
    setShowModal(true);
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavbarPengurus />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <FontAwesomeIcon icon={faSpinner} className="h-8 w-8 text-blue-600 animate-spin" />
                <p className="mt-2 text-gray-600">Memuat data pengguna...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarPengurus />

      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faCircleCheck} className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-700">{success}</span>
              </div>
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faCircleExclamation} className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          <div className=" bg-white rounded-xl shadow p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Kelola Pengguna
            </h1>
            <p className="text-gray-600">
              Data jamaah dan pengurus masjid
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div className="relative w-full md:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari nama, username, atau kontak..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full md:w-80 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
            
            <button
              onClick={handleAddNew}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition"
            >
              <FontAwesomeIcon icon={faPlus} className="w-5 h-5" />
              Tambah User
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Total Users
              </h3>
              <p className="text-3xl font-bold text-gray-800">{users.length}</p>
              <p className="text-gray-600 mt-2 flex items-center gap-1">
                <FontAwesomeIcon icon={faUsers} className="w-4 h-4" />
                Semua pengguna terdaftar
              </p>
            </div>
            
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Jamaah
              </h3>
              <p className="text-3xl font-bold text-emerald-600">{jamaahUsers.length}</p>
              <p className="text-gray-600 mt-2 flex items-center gap-1">
                <FontAwesomeIcon icon={faUser} className="w-4 h-4" />
                Pengguna dengan role jamaah
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Pengurus
              </h3>
              <p className="text-3xl font-bold text-blue-600">{pengurusUsers.length}</p>
              <p className="text-gray-600 mt-2 flex items-center gap-1">
                <FontAwesomeIcon icon={faUserTie} className="w-4 h-4" />
                Pengguna dengan role pengurus
              </p>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Jamaah
              </h2>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs md:text-lg xl:text-lg font-medium text-gray-500 uppercase tracking-wider">No</th>
                      <th className="px-6 py-3 text-left text-xs md:text-lg xl:text-lg font-medium text-gray-500 uppercase tracking-wider">Username</th>
                      <th className="px-6 py-3 text-left text-xs md:text-lg xl:text-lg font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                      <th className="px-6 py-3 text-left text-xs md:text-lg xl:text-lg font-medium text-gray-500 uppercase tracking-wider">Kontak</th>
                      <th className="px-6 py-3 text-left text-xs md:text-lg xl:text-lg font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs md:text-lg xl:text-lg font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredJamaah.map((user, index) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm md:text-lg xl:text-lg text-gray-900">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm md:text-lg xl:text-lg text-gray-900">
                          <div className="font-medium">{user.username}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm md:text-lg xl:text-lg font-medium text-gray-900">{user.nama}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm md:text-lg xl:text-lg text-gray-900">{user.kontak}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs md:text-lg xl:text-lg leading-5 font-semibold rounded-full ${
                              user.status === "aktif"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleEdit(user)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit"
                            >
                              <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(user.id, user.status)}
                              className={user.status === 'aktif' ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}
                              title={user.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                            >
                              <FontAwesomeIcon 
                                icon={user.status === 'aktif' ? faToggleOn : faToggleOff} 
                                className="w-4 h-4" 
                              />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Hapus"
                            >
                              <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredJamaah.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                          Tidak ada data jamaah
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="mb-12 mt-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Pengurus Masjid
              </h2>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs md:text-lg xl:text-lg font-medium text-gray-500 uppercase tracking-wider">No</th>
                      <th className="px-6 py-3 text-left text-xs md:text-lg xl:text-lg font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                      <th className="px-6 py-3 text-left text-xs md:text-lg xl:text-lg font-medium text-gray-500 uppercase tracking-wider">Username</th>
                      <th className="px-6 py-3 text-left text-xs md:text-lg xl:text-lg font-medium text-gray-500 uppercase tracking-wider">Kontak</th>
                      <th className="px-6 py-3 text-left text-xs md:text-lg xl:text-lg font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs md:text-lg xl:text-lg font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPengurus.map((user, index) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm md:text-lg xl:text-lg text-gray-900">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm md:text-lg xl:text-lg font-medium text-gray-900">{user.nama}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm md:text-lg xl:text-lg text-gray-900">{user.username}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm md:text-lg xl:text-lg text-gray-900">{user.kontak}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs md:text-lg xl:text-lg leading-5 font-semibold rounded-full ${
                              user.status === "aktif"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleEdit(user)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit"
                            >
                              <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(user.id, user.status)}
                              className={user.status === 'aktif' ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}
                              title={user.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                            >
                              <FontAwesomeIcon 
                                icon={user.status === 'aktif' ? faToggleOn : faToggleOff} 
                                className="w-4 h-4" 
                              />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Hapus"
                            >
                              <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredPengurus.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                          Tidak ada data pengurus
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

    {showModal && (
  <div className="fixed inset-0 bg-black/5 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b">
        <h3 className="text-xl font-bold text-gray-800">
          {editingId ? 'Edit Pengguna' : 'Tambah Pengguna'}
        </h3>
        <button
          onClick={() => {
            setShowModal(false);
            resetForm();
          }}
          className="text-gray-500 hover:text-gray-700 text-lg"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      {/* Form */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kolom Kiri */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nama lengkap"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Username"
                  required
                />
              </div>

              {!editingId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Password"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Default: password123 (jika dikosongkan)
                  </p>
                </div>
              )}
            </div>

            {/* Kolom Kanan */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="jamaah">Jamaah</option>
                    <option value="pengurus">Pengurus</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kontak
                </label>
                <input
                  type="text"
                  name="kontak"
                  value={formData.kontak}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nomor telepon"
                />
              </div>
            </div>
          </div>

          {/* Alamat */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat
            </label>
            <textarea
              name="alamat"
              value={formData.alamat}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Alamat lengkap"
              rows="2"
            />
          </div>

          {/* Tombol */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="px-4 py-2 border text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded-lg font-medium ${
                loading 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading ? 'Menyimpan...' : editingId ? 'Update' : 'Simpan'}
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

export default KelolaUsers;