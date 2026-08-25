import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@clerk/react";
import { useUserRole } from "./useUserRole";

interface RoleGuardProps {
  allowedRoles: string[];
  children: ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const { role, isLoading } = useUserRole();

  if (!isLoaded || isLoading) {
    return null;
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  if (role === "ADMIN" || allowedRoles.includes(role)) {
    return <>{children}</>;
  }

  return <Navigate to="/unauthorized" replace />;
}

export default RoleGuard;
