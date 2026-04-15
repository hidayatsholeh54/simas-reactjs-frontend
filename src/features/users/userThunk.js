import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchUsers = createAsyncThunk(
    "users/fetchUsers",
    async (_, thunkAPI) => {
        try {
            const response = await api.get("/users")
            console.log(response.data, "data user")
            return response.data
        }catch (error) {
            thunkAPI.rejectWithValue(error.message);
        }
    }
)

export const addUser =  createAsyncThunk(
    "users/addUser",
    async (userData, thunkAPI) => {
        try {
            const existingUsers =  await api.get(`/users?username=${userData.username}`);
            if (existingUsers.data.length > 0) {
                throw new Error("username sudah digunakan")
            }

            const newUser = {
                    id: Date.now(),
                    username: userData.username,
                    password: userData.password || "password123",
                    role: userData.role || "jamaah",
                    nama: userData.nama,
                    kontak: userData.kontak || "",
                    alamat: userData.alamat || "",
                    status: userData.status || "aktif"
            };
            const response = await api.post("/users", newUser);
            return response.data
        } catch (error){
            return thunkAPI.rejectWithValue(error.message);
        }
    }
)

// Update user
export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/users/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete user
export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Toggle user status (aktif/nonaktif)
export const toggleUserStatus = createAsyncThunk(
  "users/toggleStatus",
  async ({ id, currentStatus }, { rejectWithValue }) => {
    try {
      const newStatus = currentStatus === "aktif" ? "nonaktif" : "aktif";
      const response = await api.patch(`/users/${id}`, { status: newStatus });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);