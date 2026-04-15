import jwtEncode from "jwt-encode";
import api from "../../services/api";

const SECRET = "SIMAS_SIMPLE";

export const loginService = async ({ username, password }) => {
  try {
    console.log("Attempting login with:", { username, password }); // Debug
    
    // Query untuk mencari user berdasarkan username dan password
    const res = await api.get(`/users?username=${username}&password=${password}&status=aktif`);
    
    console.log("API Response:", res.data); // Debug
    
    if (res.data.length === 0) {
      throw new Error("Username atau password salah");
    }

    const user = res.data[0];
    
    console.log("User found:", user); // Debug

    // Buat token JWT sederhana
    const token = jwtEncode(
      {
        id: user.id,
        role: user.role,
        exp: Date.now() + 60 * 60 * 1000 // 1 jam
      },
      SECRET
    );

    return {
      token,
      user: {
        id: user.id,
        nama: user.nama,
        role: user.role
      }
    };
  } catch (error) {
    console.error("Login service error:", error);
    throw new Error(error.message || "Terjadi kesalahan saat login");
  }
};