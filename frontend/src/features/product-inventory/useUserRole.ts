import { useState, useEffect } from "react";
import { useAuth } from "@clerk/react";
import api from "../../services/api";
import type { ApiResponse } from "./types";

interface UserInfo {
  id: number;
  role: string;
  email: string | null;
}

/**
 * Fetches the current user's role from our own backend.
 * We store roles in MySQL, not in Clerk, so we ask the backend
 * what role this user has rather than reading it from the JWT.
 *
 * Returns { role, loading } — use role to check permissions in components.
 */
export function useUserRole() {
  const { isSignedIn } = useAuth();
  const [role, setRole] = useState<string>("CUSTOMER");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }
    api
      .get<ApiResponse<UserInfo>>("/users/me")
      .then((res) => setRole(res.data.data.role))
      .catch(() => setRole("CUSTOMER"))
      .finally(() => setLoading(false));
  }, [isSignedIn]);

  return { role, loading };
}
