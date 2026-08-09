import axios from "axios";

// Base URL for the Spring Boot backend. Override per-machine with a
// VITE_API_BASE_URL entry in a local .env file (never commit real .env files).
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Placeholder for attaching the Clerk auth token once auth is wired up.
// api.interceptors.request.use((config) => { ... return config; });

export default api;
