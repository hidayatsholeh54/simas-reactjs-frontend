// components/Navbar.js
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { isLoggedIn, isPengurus } from "../utils/auth";
import { getKonfigurasiMasjid } from "../services/masjidService";
import { logout } from "../features/auth/authSlice";
import { useDispatch } from "react-redux";

export default function Navbar() {
  // const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [masjid, setMasjid] = useState(null);
  const dispatch = useDispatch();
  const loggedIn = isLoggedIn();

  useEffect(() => {
    getKonfigurasiMasjid().then(setMasjid);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="fixed top-0 w-full bg-white shadow-md z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
            <Link to="/" className="font-bold text-xl text-emerald-600">
              SIMAS {masjid?.nama_masjid ? `${masjid.nama_masjid}` : ''}
            </Link>

          <div className="hidden md:flex items-center space-x-6 text-sm md:text-lg xl:text-lg ">
            <Link 
              to="/#hero" 
              className="text-gray-700 hover:text-emerald-600 transition-colors duration-300"
            >
              Beranda
            </Link>
            
            <Link 
              to="/#tentang" 
              className="text-gray-700 hover:text-emerald-600 transition-colors duration-300"
            >
              Tentang Kami
            </Link>
            
            <Link 
              to="/#kegiatan" 
              className="text-gray-700 hover:text-emerald-600 transition-colors duration-300"
            >
              Kegiatan
            </Link>
            
            <div className="flex items-center space-x-4 ml-4">
              {!loggedIn ? (
                <Link
                  to="/login"
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors duration-300 text-sm font-medium"
                >
                  Login
                </Link>
              ) : (
                <>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-emerald-600 font-medium">
                        {user?.nama?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="text-gray-700 font-medium text-sm">
                      {user?.nama || 'User'}
                    </span>
                  </div>
                  
                  {isPengurus() && (
                    <Link
                      to="/pengurus/dashboard"
                      className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors duration-300 text-sm font-medium"
                    >
                      Dashboard
                    </Link>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-colors duration-300 text-sm font-medium"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>

          <button className="md:hidden text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <div className="md:hidden mt-4 hidden">
          <div className="flex flex-col space-y-3">
            <Link 
              to="/#hero" 
              className="text-gray-700 hover:text-emerald-600 py-2"
            >
              Beranda
            </Link>
            <Link 
              to="/#jadwal" 
              className="text-gray-700 hover:text-emerald-600 py-2"
            >
              Jadwal
            </Link>
            <Link 
              to="/#pengumuman" 
              className="text-gray-700 hover:text-emerald-600 py-2"
            >
              Pengumuman
            </Link>
            <Link 
              to="/#kegiatan" 
              className="text-gray-700 hover:text-emerald-600 py-2"
            >
              Kegiatan
            </Link>
            
            {isLoggedIn() && (
              <>
                <div className="flex items-center space-x-2 py-2">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600 font-medium">
                      {user?.nama?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="text-gray-700 font-medium">
                    {user?.nama || 'User'}
                  </span>
                </div>
                
                {isPengurus() && (
                  <Link
                    to="/pengurus/dashboard"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-center"
                  >
                    Dashboard Admin
                  </Link>
                )}
                
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-center"
                >
                  Logout
                </button>
              </>
            )}
            
            {!isLoggedIn() && (
              <Link
                to="/login"
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-center"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}