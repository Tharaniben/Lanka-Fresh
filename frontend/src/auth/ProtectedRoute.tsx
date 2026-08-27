import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@clerk/react";
import { useUserRole } from "./useUserRole";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const { role, isLoading } = useUserRole();

  if (!isLoaded || (isSignedIn && allowedRoles && isLoading)) {
    return null;
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
}

export default ProtectedRoute;
