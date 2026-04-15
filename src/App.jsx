import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import ProtectedRoute from "./routes/protectedRoute";
import RoleGuard from "./routes/roleGuard";
import DashboardJamaah from "./pages/Jamaah/DashboardJamaah";
import HomeJamaah from "./pages/Jamaah/HomeJamaah";
import HomePengurus from "./pages/PengurusMasjid/HomePengurus";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import KelolaUsers from "./pages/PengurusMasjid/KelolaUsers";
import KelolaPengumuman from "./pages/PengurusMasjid/KelolaPengumuman";
import PengumumanJamaah from "./pages/Jamaah/PengumumanJamaah";
import KelolaInfak from "./pages/PengurusMasjid/KelolaInfak";
import InfakJamaah from "./pages/Jamaah/InfakJamaah";
import SurahList from "./pages/Jamaah/Quran/QuranList";
import SurahDetail from "./pages/Jamaah/Quran/QuranDetail";
import JadwalSholat from "./pages/Jamaah/JadwalSholat";
import KelolaImam from "./pages/PengurusMasjid/KelolaImam";
import JadwalImam from "./pages/Jamaah/JadwalImam";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES - dengan Navbar & Footer */}
        <Route path="/" element={
          <>
            <Navbar />
            <DashboardJamaah />
            <Footer />
          </>
        } />
        
        {/* LOGIN - tanpa Navbar & Footer */}
        <Route path="/login" element={<Login />} />
        
        {/* REDIRECT BERDASARKAN ROLE SETELAH LOGIN */}
        <Route path="/redirect" element={<RedirectBasedOnRole />} />
        
        {/* JAMAAH DASHBOARD */}
        <Route
          path="/jamaah/dashboard"
          element={
            <ProtectedRoute>
              <RoleGuard role="jamaah">
                <HomeJamaah />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route path="/jamaah/pengumuman" element={
          <ProtectedRoute>
            <RoleGuard role="jamaah">
              <PengumumanJamaah />
            </RoleGuard>
          </ProtectedRoute>
        } 
        />
        <Route path="/jamaah/infak" element={
          <ProtectedRoute>
            <RoleGuard role="jamaah">
              <InfakJamaah />
            </RoleGuard>
          </ProtectedRoute>
        } />

        <Route path="/jamaah/quran" element={
          <ProtectedRoute>
            <RoleGuard role="jamaah">
              <SurahList />
            </RoleGuard>
          </ProtectedRoute>
        } />

        <Route path="/jamaah/quran/:number" element={
          <ProtectedRoute>
            <RoleGuard role="jamaah">
              <SurahDetail />
            </RoleGuard>
          </ProtectedRoute>
        } />

        <Route path="/jamaah/jadwal-sholat" element={
          <ProtectedRoute>
            <RoleGuard role="jamaah">
              <JadwalSholat />
            </RoleGuard>
          </ProtectedRoute>
        }
        />

        <Route path="/jamaah/jadwal-imam" element={
          <ProtectedRoute>
            <RoleGuard role="jamaah">
              <JadwalImam/>
            </RoleGuard>
          </ProtectedRoute>
        }
        />

        {/* Pengurus */}
        <Route path="/pengurus/keuangan" element={
          <ProtectedRoute>
            <RoleGuard role="pengurus">
              <KelolaInfak />
            </RoleGuard>
          </ProtectedRoute>
        } 
        />
        
        {/* PENGURUS DASHBOARD */}
        <Route
          path="/pengurus/dashboard"
          element={
            <ProtectedRoute>
              <RoleGuard role="pengurus">
                <HomePengurus />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
         <Route path="/pengurus/users" element={
          <ProtectedRoute>
            <RoleGuard role="pengurus">
              <KelolaUsers />
            </RoleGuard>
          </ProtectedRoute>
        } />
          <Route path="/pengurus/pengumuman" element={
          <ProtectedRoute>
            <RoleGuard role="pengurus">
              <KelolaPengumuman />
            </RoleGuard>
          </ProtectedRoute>
        } />
        <Route path="/pengurus/imam" element={
          <ProtectedRoute>
            <RoleGuard role="pengurus">
              <KelolaImam />
            </RoleGuard>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

// Komponen untuk redirect berdasarkan role setelah login
function RedirectBasedOnRole() {
  const user = JSON.parse(localStorage.getItem("user"));
  
  console.log("Redirect user:", user);
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (user.role === "pengurus") {
    return <Navigate to="/pengurus/dashboard" />;
  } else if (user.role === "jamaah") {
    return <Navigate to="/jamaah/dashboard" />;
  } else {
    // Default redirect ke halaman utama
    return <Navigate to="/" />;
  }
}