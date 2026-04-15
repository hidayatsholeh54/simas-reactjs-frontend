import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import userReducer from "../features/users/usersSlice";
import pengumumanReducer from "../features/pengumuman/pengumumanSlice";
import keuanganReducer from "../features/keuangan/keuanganSlice";
import imamReducer from '../features/imam/imamSlice';
import notifikasiReducer from '../features/notifikasi/notifikasiSlice';


export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    pengumuman: pengumumanReducer,
    keuangan: keuanganReducer,
    imam: imamReducer,
    notifikasi:  notifikasiReducer
  },
});