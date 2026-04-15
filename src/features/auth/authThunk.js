import { createAsyncThunk } from "@reduxjs/toolkit";
import { loginService } from "./authServices";

export const login = createAsyncThunk(
  "auth/login",
  async (payload, thunkAPI) => {
    try {
      console.log("Login thunk payload:", payload); 
      const response = await loginService(payload);
      console.log("Login response:", response); 
      
      console.log("Token created:", response.token);
      console.log("User data:", response.user);
      
      return response;
    } catch (err) {
      console.error("Login thunk error:", err);
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);