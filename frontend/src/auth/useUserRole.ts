import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/react";
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
  | "BRANCH_MANAGER";

/**
 * Fetches the current user's role from the LankaFresh backend.
 * Returns { role, isLoading, loading }.
 * Falls back to "CUSTOMER" if unauthenticated or on fetch failure.
 */
export function useUserRole() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [role, setRole] = useState<string>(() => {
    return localStorage.getItem("lankafresh_active_role") || "CUSTOMER";
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    async function fetchRole() {
      // Automatic privilege for project owner / branch manager email
      const userEmail = user?.primaryEmailAddress?.emailAddress || "";
      if (userEmail.toLowerCase() === "binukadil2005@gmail.com") {
        setRole("BRANCH_MANAGER");
        localStorage.setItem("lankafresh_active_role", "BRANCH_MANAGER");
      }

      // Check Clerk metadata
      const clerkMetaRole = (user?.publicMetadata?.role as string) || (user?.unsafeMetadata?.role as string);
      if (clerkMetaRole && isMounted) {
        setRole(clerkMetaRole);
      }

      // Check localStorage override
      const cached = localStorage.getItem("lankafresh_active_role");
      if (cached && isMounted) {
        setRole(cached);
      }

      try {
        const token = await getToken();
        const headers: Record<string, string> = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
        const res = await api.get<ApiResponse<UserInfo>>("/users/me", { headers });
        if (isMounted) {
          const userRole = res.data?.data?.role;
          if (userRole) {
            setRole(userRole);
            localStorage.setItem("lankafresh_active_role", userRole);
          }
        }
      } catch (err) {
        console.error("Failed to fetch user role from /users/me:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchRole();

    return () => {
      isMounted = false;
    };
  }, [isLoaded, isSignedIn, getToken, user]);

  const effectiveLoading = !isLoaded ? true : isSignedIn ? isLoading : false;

  return {
    role,
    isLoading: effectiveLoading,
    loading: effectiveLoading,
  };
}

export default useUserRole;
