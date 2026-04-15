import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../features/auth/authSlice";

export default function NavbarPengurus() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth);
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
            <div className="bg-white w-8 h-8 rounded-lg flex items-center justify-center">
              <span className="text-emerald-600 font-bold">P</span>
            </div>
            <Link to="/pengurus/dashboard" className="font-bold text-xs md:text-lg xl:text-xl text-emerald-600">
              SIMAS Pengurus
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8 text-sm md:text-lg xl:text-lg">
            <Link to="/pengurus/dashboard" className="hover:text-emerald-700 transition">
              Dashboard
            </Link>
            <Link to="/pengurus/users" className="hover:text-emerald-700 transition">
              Kelola Jamaah
            </Link>
            <Link to="/pengurus/imam" className="hover:text-emerald-700 transition">
              Kelola Imam & Jadwal
            </Link>
            <Link to="/pengurus/keuangan" className="hover:text-emerald-700 transition">
              Kelola Keuangan
            </Link>
            <Link to="/pengurus/pengumuman" className="hover:text-emerald-700 transition">
              Kelola Pengumuman
            </Link>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-emerald-600 font-bold">
                    {user?.nama?.charAt(0) || 'P'}
                  </span>
                </div>
                <span className="font-medium">
                  {user?.nama || 'Pengurus'}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition"
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