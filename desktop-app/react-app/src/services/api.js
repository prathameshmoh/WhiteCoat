import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:5000",
  withCredentials: false, // explicit, avoids Electron quirks
});

/* ================= REQUEST INTERCEPTOR ================= */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // always ensure headers object exists
    config.headers = config.headers || {};

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= RESPONSE INTERCEPTOR ================= */
/* Auto logout on invalid / expired token */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 🔴 token invalid / expired
      localStorage.clear();
      delete api.defaults.headers.common["Authorization"];

      // Electron-safe redirect
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

/* ================= HELPERS ================= */

export const createVisitFromAppointment = (appointmentId) => {
  return api.post(`/visits/from-appointment/${appointmentId}`);
};

/* Explicit logout helper */
export const clearAuth = () => {
  localStorage.clear();
  delete api.defaults.headers.common["Authorization"];
};

export default api;
