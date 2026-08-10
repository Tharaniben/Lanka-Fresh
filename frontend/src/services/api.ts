import axios from "axios";

// Base URL for the Spring Boot backend. Override per-machine with a
// VITE_API_BASE_URL entry in a local .env file (never commit real .env files).
const baseURL: string =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Placeholder for attaching the Clerk session token once auth is wired up:
// api.interceptors.request.use(async (config) => {
//   const token = await getToken();
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

export default api;
