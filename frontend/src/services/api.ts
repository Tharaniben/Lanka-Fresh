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

// api.ts is a plain module, not a React component, so it can't call
// useAuth() directly. AuthSync (see src/auth/AuthSync.tsx) calls
// setTokenGetter() once, near the root of the app, with Clerk's getToken
// function. Every request then asks for a fresh token before sending.
type TokenGetter = () => Promise<string | null>;
let getToken: TokenGetter = async () => null;

export function setTokenGetter(fn: TokenGetter) {
  getToken = fn;
}

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
