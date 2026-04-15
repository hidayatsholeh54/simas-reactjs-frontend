// utils/auth.js
import { jwtDecode } from "jwt-decode";

const SECRET = "SIMAS_SIMPLE";

export const isLoggedIn = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return false;

    // Untuk JWT sederhana, kita bisa cek expire time
    const decoded = jwtDecode(token);
    const currentTime = Date.now();
    
    if (decoded.exp < currentTime) {
      // Token expired
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Auth check error:", error);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return false;
  }
};

export const getUserRole = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.role || null;
  } catch (error) {
    console.log(error)
    return null;
  }
};

export const isJamaah = () => {
  return getUserRole() === "jamaah";
};

export const isPengurus = () => {
  return getUserRole() === "pengurus";
};
