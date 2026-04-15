import { useSelector } from "react-redux";
import NavbarPengurus from "./NavbarPengurus";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserTie,
  faArrowRight,
  faUsers,
  faMoneyBillWave,
  faBullhorn,
} from "@fortawesome/free-solid-svg-icons";

export default function HomePengurus() {
  const {user} = useSelector((state) => state.auth);

  const cards = [
    {
      id: 1,
      title: "Kelola Jamaah",
      description: "Kelola data jamaah dan keanggotaan masjid",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-600",
      path: "/pengurus/users",
      icon: <FontAwesomeIcon icon={faUsers} className="text-4xl" />,
    },
    {
      id: 2,
      title: "Kelola Imam",
      description: "Tambah, edit, dan atur data imam masjid",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-600",
      path: "/pengurus/imam",
      icon: <FontAwesomeIcon icon={faUserTie} className="text-4xl" />,
    },
    {
      id: 3,
      title: "Kelola Keuangan",
      description: "Input dan kelola keuangan masjid",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      textColor: "text-emerald-600",
      path: "/pengurus/keuangan",
      icon: <FontAwesomeIcon icon={faMoneyBillWave} className="text-4xl" />,
    },
    {
      id: 4,
      title: "Pengumuman",
      description: "Buat dan kelola pengumuman untuk jamaah",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-600",
      path: "/pengurus/pengumuman",
      icon: <FontAwesomeIcon icon={faBullhorn} className="text-4xl" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarPengurus />
    
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faUserTie} className="text-2xl text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-1">
                  Dashboard Pengurus
                </h1>
                <p className="text-gray-600">
                  Selamat datang kembali, <span className="font-semibold text-blue-600">{user?.nama}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {cards.map((card) => (
              <Link
                key={card.id}
                to={card.path}
                className={`${card.bgColor} border ${card.borderColor} rounded-xl p-6 hover:shadow-lg transition-all hover:-translate-y-1 group`}
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
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}