// pages/Jamaah/HomeJamaah.jsx
import NavbarJamaah from "./NavbarJamaah";
import NotifikasiJumat from "../../components/NotifikasiJumat";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWallet,
  faClock,
  faBullhorn,
  faQuran,
  faUser,
  faArrowRight,
  faUserTie
} from "@fortawesome/free-solid-svg-icons";

export default function HomeJamaah() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const cards = [
    {
      id: 1,
      title: "Laporan Keuangan",
      description: "Lihat laporan keuangan masjid secara transparan",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      textColor: "text-emerald-600",
      path: "/jamaah/infak",
      icon: <FontAwesomeIcon icon={faWallet} className="text-4xl" />,
    },
    {
    id: 2,
    title: "Jadwal Imam",
    description: "Lihat jadwal imam yang bertugas",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-600",
    path: "/jamaah/jadwal-imam",
    icon: <FontAwesomeIcon icon={faUserTie} className="text-4xl" />,
    },
    {
      id: 3,
      title: "Jadwal Sholat",
      description: "Cek jadwal sholat tiap kota di Indonesia",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-600",
      path: "/jamaah/jadwal-sholat",
      icon: <FontAwesomeIcon icon={faClock} className="text-4xl" />,
    },
    {
      id: 4,
      title: "Pengumuman",
      description: "Baca pengumuman terbaru dari pengurus masjid",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-600",
      path: "/jamaah/pengumuman",
      icon: <FontAwesomeIcon icon={faBullhorn} className="text-4xl" />,
    },
    {
      id: 5,
      title: "Al-Qur'an Digital",
      description: "Baca dan dengarkan ayat suci Al-Qur'an",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      textColor: "text-amber-600",
      path: "/jamaah/quran",
      icon: <FontAwesomeIcon icon={faQuran} className="text-4xl" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarJamaah />

      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Notifikasi */}
          <NotifikasiJumat />

          <div className="inset-0 bg-linear-to-br from-teal-800 via-emerald-700 to-teal-600 rounded-xl shadow p-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faUser} className="text-2xl text-emerald-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  Dashboard Jamaah
                </h1>
                <p className="text-white">
                  Selamat datang kembali, <span className="font-semibold text-white">{user?.nama}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-5 gap-6">
            {cards.map((card) => (
              <div
                key={card.id}
                onClick={() => navigate(card.path)}
                className={`${card.bgColor} border ${card.borderColor} rounded-xl p-6 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group`}
              >
                <div className={`${card.textColor} mb-4 group-hover:${card.textColor.replace('600', '700')}`}>
                  {card.icon}
                </div>
                <h3 className={`text-xl font-semibold text-gray-800 mb-2 group-hover:${card.textColor.replace('600', '700')}`}>
                  {card.title}
                </h3>
                <p className="text-gray-600 group-hover:text-gray-700 mb-4">
                  {card.description}
                </p>
                <div className={`${card.textColor} flex items-center group-hover:${card.textColor.replace('600', '700')}`}>
                  <span className="text-sm font-medium">Akses Fitur</span>
                  <FontAwesomeIcon icon={faArrowRight} className="ml-2 w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}