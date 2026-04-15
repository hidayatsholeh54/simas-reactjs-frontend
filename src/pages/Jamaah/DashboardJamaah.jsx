import { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { isLoggedIn, isJamaah } from "../../utils/auth";
import { getKonfigurasiMasjid } from "../../services/masjidService";

export default function DashboardJamaah() {
  const loggedIn = isLoggedIn();
  const jamaah = isJamaah();
  const [masjid, setMasjid] = useState(null);
  const location = useLocation();
  
  // Refs untuk setiap section
  const heroRef = useRef(null);
  const tentangRef = useRef(null);
  const kegiatanRef = useRef(null);

  useEffect(() => {
    getKonfigurasiMasjid().then(setMasjid);
  }, []);

  // Fungsi untuk scroll ke element dengan tepat
  const scrollToElement = (element) => {
    if (element) {
      const navbarHeight = 64; // Tinggi navbar dalam px
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  // Handle hash change pada URL
  useEffect(() => {
    const handleHashScroll = () => {
      const hash = window.location.hash;
      
      if (hash) {
        const sectionId = hash.replace('#', '');
        
        setTimeout(() => {
          let targetElement = null;
          
          switch(sectionId) {
            case 'hero':
              targetElement = heroRef.current;
              break;
            case 'tentang':
              targetElement = tentangRef.current;
              break;
            case 'kegiatan':
              targetElement = kegiatanRef.current;
              break;
            default:
              targetElement = document.getElementById(sectionId);
          }
          
          if (targetElement) {
            scrollToElement(targetElement);
          }
        }, 100);
      }
    };

    handleHashScroll();
    window.addEventListener('hashchange', handleHashScroll);
    
    return () => {
      window.removeEventListener('hashchange', handleHashScroll);
    };
  }, []);

  // Handle location change
  useEffect(() => {
    if (location.hash) {
      const sectionId = location.hash.replace('#', '');
      setTimeout(() => {
        let targetElement = null;
        
        switch(sectionId) {
          case 'hero':
            targetElement = heroRef.current;
            break;
          case 'tentang':
            targetElement = tentangRef.current;
            break;
          case 'kegiatan':
            targetElement = kegiatanRef.current;
            break;
          default:
            targetElement = document.getElementById(sectionId);
        }
        
        if (targetElement) {
          scrollToElement(targetElement);
        }
      }, 100);
    }
  }, [location]);

  return (
    <div className="flex flex-col pt-0">
      {/* HERO SECTION - Section pertama */}
      <section
        ref={heroRef}
        id="hero"
        className="min-h-screen flex flex-col justify-center items-center px-6 text-center relative bg-cover bg-center pt-16" 
        style={{ backgroundImage: "url('/images/bg-masjid1.jpg')" }}
      >
        <h1 className="text-4xl font-bold mb-4 text-white">
          Selamat Datang di SIMAS {masjid?.nama_masjid}
        </h1>
        <p className="text-white max-w-2xl">
          Masjid yang berlokasi di {masjid?.lokasi}, sebagai pusat ibadah,
          dakwah, dan kegiatan umat.
        </p>

        <div className="max-w-2xl mx-auto mt-2">
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-5 border border-white/10">
            <p className="text-white/95 text-lg italic border-l-4 border-emerald-400 pl-4 text-left">
              "Sesungguhnya yang memakmurkan masjid Allah hanyalah orang-orang yang beriman kepada Allah dan hari kemudian."
              <span className="block text-emerald-300 text-sm mt-2 font-semibold not-italic">— QS. At-Taubah: 18</span>
            </p>
          </div>
        </div>
      </section>

      <section
        ref={tentangRef}
        id="tentang"
        className="min-h-screen flex items-center from-emerald-50 to-teal-100 px-6"
      >
        <div className="max-w-5xl mx-auto w-full">
          <h2 className="text-4xl font-bold mb-8 text-emerald-800">Tentang Kami</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <p className="text-gray-700 text-lg leading-relaxed">
                <span className="font-semibold text-emerald-700">SIMAS</span> adalah Sistem Informasi Manajemen Masjid yang dirancang untuk memudahkan pengelolaan dan komunikasi antara pengurus masjid dengan jamaah.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                Kami hadir untuk memberikan transparansi dalam pengelolaan keuangan, informasi kegiatan yang akurat, serta mempermudah akses jamaah terhadap layanan masjid secara digital.
              </p>
              <div className="pt-4">
                <div className="flex items-center gap-4 text-emerald-700">
                  <div className="flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{masjid?.lokasi || "Indonesia"}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-semibold mb-4 text-emerald-800">Visi & Misi</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-emerald-600">Visi</h4>
                  <p className="text-gray-600">Menjadi pusat informasi dan pelayanan masjid terdepan yang memudahkan jamaah dalam beribadah dan beraktivitas.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-emerald-600">Misi</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Menyediakan informasi yang transparan dan akurat</li>
                    <li>Memudahkan komunikasi antara pengurus dan jamaah</li>
                    <li>Mendukung kegiatan keagamaan dan sosial masjid</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={kegiatanRef}
        id="kegiatan"
        className="min-h-screen flex items-center from-slate-50 to-white px-6"
      >
        <div className="max-w-5xl mx-auto w-full">
          <h2 className="text-4xl font-bold mb-8 text-emerald-800">Fitur & Kegiatan Jamaah</h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Laporan Keuangan</h3>
              <p className="text-gray-600">Pantau transparansi keuangan masjid secara real-time dan akuntabel.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Agenda Kegiatan</h3>
              <p className="text-gray-600">Informasi lengkap jadwal kajian, pengajian, dan kegiatan rutin masjid.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Info Imam & Khatib</h3>
              <p className="text-gray-600">Jadwal Sholat, imam dan khatib sholat Jumat serta Al Quran Digital</p>
            </div>
          </div>

          {!loggedIn && (
            <div className="text-center bg-emerald-50 p-8 rounded-2xl">
              <p className="text-gray-700 text-lg mb-4">
                Silakan login untuk mengakses fitur jamaah lengkap dan informasi lebih detail.
              </p>
              <Link to="/login">
                <button className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition-colors duration-300">
                  Login Sekarang
                </button>
              </Link>
            </div>
          )}

          {loggedIn && jamaah && (
            <div className="bg-emerald-50 p-8 rounded-2xl">
              <h3 className="text-2xl font-semibold mb-4 text-emerald-800">Fitur Khusus Jamaah</h3>
              <ul className="grid md:grid-cols-2 gap-4 text-gray-700 text-lg">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  Laporan keuangan masjid secara transparan
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  Agenda kegiatan masjid secara detail
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  Informasi imam dan khatib sholat Jumat
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  Notifikasi kegiatan dan pengumuman terbaru
                </li>
              </ul>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}