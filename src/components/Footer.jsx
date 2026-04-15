import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getKonfigurasiMasjid } from "../services/masjidService";

export default function Footer() {
  const [masjid, setMasjid] = useState(null);

  useEffect(() => {
    getKonfigurasiMasjid().then(setMasjid);
  }, []);

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-12">
        
        <div>
          <h2 className="font-bold mb-2 text-emerald-400">
            {masjid?.nama_masjid || "SIMAS"}
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Berlokasi di {masjid?.lokasi}.  
            <br />
            Pusat ibadah, dakwah, dan kegiatan umat Islam.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Periode {masjid?.periode_tahun}
          </p>
        </div>

        <div>
          <h3 className="text-emerald-400 font-semibold mb-4">
            Hubungi Kami
          </h3>
          <p className="text-sm text-gray-300 mb-2">
            Email:{" "}
            <a
              href="mailto:info@masjid.com"
              className="hover:text-emerald-400 transition-colors"
            >
              infomasjid_almubarok@gmail.com
            </a>
          </p>
          <p className="text-sm text-gray-300">
            Telepon:{" "}
            <a
              href="tel:+6281234567890"
              className="hover:text-emerald-400 transition-colors"
            >
              +62 812-3456-7890
            </a>
          </p>
        </div>

        <div>
          <h3 className="text-emerald-400 font-semibold mb-4">
            Ikuti Kami
          </h3>
          <div className="space-y-3 text-sm text-gray-300">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 hover:text-emerald-400 transition-colors"
            >
              <i className="bi bi-instagram"></i>
              <span>Instagram : @masjid_almubarok</span>
            </a>

            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 hover:text-emerald-400 transition-colors"
            >
              <i className="bi bi-facebook"></i>
              <span>Facebook : @masjid_almubarok</span>
            </a>

            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 hover:text-emerald-400 transition-colors"
            >
              <i className="bi bi-youtube"></i>
              <span>YouTube : masjid_almubarok</span>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-700"></div>

      <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} SIMAS — Sistem Informasi Manajemen Masjid
      </div>
    </footer>
  );
}