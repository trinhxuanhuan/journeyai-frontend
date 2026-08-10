// lib/api.ts
import axios from "axios";
import { translateErrorMessage } from "@/lib/error-messages";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

// Tự động gắn Bearer token vào mọi request nếu đã đăng nhập
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("journeyai_access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Trích message lỗi từ Backend ({error, message}) để hiển thị toast dễ dàng hơn
export function getApiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    if (data?.message) return translateErrorMessage(data.message);
  }
  return "Đã có lỗi xảy ra, vui lòng thử lại.";
}