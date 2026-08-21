import { useEffect } from "react";
import { useAuth } from "@clerk/react";
import { setTokenGetter } from "../services/api";

/**
 * Mount this once near the root of the app (see App.tsx). It has no visual
 * output — it just keeps api.ts supplied with a way to fetch a fresh Clerk
 * session token for every outgoing request.
 */
function AuthSync() {
  const { getToken } = useAuth();

  useEffect(() => {
    setTokenGetter(() => getToken());
  }, [getToken]);

  return null;
}

export default AuthSync;
