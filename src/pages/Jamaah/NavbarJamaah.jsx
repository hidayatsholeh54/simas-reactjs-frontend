import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../features/auth/authSlice";


export default function NavbarJamaah() {
  const navigate = useNavigate();
  const {user} = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <nav className="fixed top-0 w-full bg-white shadow-md z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-emerald-600 w-8 h-8 rounded-lg"></div>
            <Link to="/jamaah/dashboard" className="font-bold text-xl text-gray-800">
              SIMAS Jamaah
            </Link>
          </div>

          {/* Menu Navigation */}
          <div className="hidden md:flex items-center space-x-6 text-sm md:text-lg xl:text-lg">
            <Link to="/jamaah/dashboard" className="text-gray-700 hover:text-emerald-600 transition">
              Dashboard
            </Link>
             <Link to="/jamaah/jadwal-imam" className="text-gray-700 hover:text-emerald-600 transition">
              Jadwal Imam
            </Link>
            <Link to="/jamaah/jadwal-sholat" className="text-gray-700 hover:text-emerald-600 transition">
              Jadwal Sholat
            </Link>
            <Link to="/jamaah/infak" className="text-gray-700 hover:text-emerald-600 transition">
              Keuangan
            </Link>
            <Link to="/jamaah/pengumuman" className="text-gray-700 hover:text-emerald-600 transition">
              Pengumuman
            </Link>
             <Link to="/jamaah/quran" className="text-gray-700 hover:text-emerald-600 transition">
              Al-Quran Digital
            </Link>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600 font-medium">
                    {user?.nama?.charAt(0) || 'J'}
                  </span>
                </div>
                <span className="text-gray-700 font-medium">
                  {user?.nama || 'Jamaah'}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}