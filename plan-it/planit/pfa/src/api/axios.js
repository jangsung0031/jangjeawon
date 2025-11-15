// src/api/axios.js
import axios from "axios";

const api = axios.create({
  //baseURL: "http://localhost:8080",
  baseURL: "",
  withCredentials: true, // ★ 쿠키 인증이면 유지
});

const getToken = () =>
  sessionStorage.getItem("token") ||
  localStorage.getItem("accessToken") ||
  null;

// 쿠키 인증을 “진짜”로 쓸 거면 Authorization은 굳이 필요 없음.
// (둘 다 쓰면 preflight가 복잡해짐)
// 필요하다면 아래 블록을 지우거나, 로그인 직후에만 보조적으로 쓰세요.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = token.startsWith("Bearer ")
      ? token
      : `Bearer ${token}`;
  }
  return config;
});

export { api };
export default api;
