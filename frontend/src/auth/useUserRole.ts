import { useState, useEffect } from "react";
import { useAuth } from "@clerk/react";
import api from "../services/api";

interface UserInfo {
  id: number;
  role: string;
  email: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
}

export type UserRole =
  | "CUSTOMER"
  | "SALES_STAFF"
  | "INVENTORY_STAFF"
  | "DELIVERY_STAFF"
  | "CRO"
  | "BRANCH_MANAGER"
  | "ADMIN";

/**
 * Fetches the current user's role from the LankaFresh backend.
 * Returns { role, isLoading, loading }.
 * Falls back to "CUSTOMER" if unauthenticated or on fetch failure.
 */
export function useUserRole() {
  const { isLoaded, isSignedIn } = useAuth();
  const [role, setRole] = useState<string>("CUSTOMER");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      return;
    }

    let isMounted = true;

    api
      .get<ApiResponse<UserInfo>>("/users/me")
      .then((res) => {
        if (isMounted) {
          const userRole = res.data?.data?.role;
          setRole(userRole || "CUSTOMER");
        }
      })
      .catch(() => {
        if (isMounted) {
          setRole("CUSTOMER");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isLoaded, isSignedIn]);

  const effectiveLoading = !isLoaded ? true : isSignedIn ? isLoading : false;

  return {
    role,
    isLoading: effectiveLoading,
    loading: effectiveLoading,
  };
}

export default useUserRole;
