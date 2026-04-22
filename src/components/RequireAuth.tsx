import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * Mock auth gate for the prototype. Real auth would read from a session
 * provider — here we just check sessionStorage so the demo always starts
 * the user at /auth/login on a fresh visit, mirroring the PRD's mobile-first
 * sign-in flow.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const loc = useLocation();
  const authed = typeof window !== "undefined" && sessionStorage.getItem("nativeid_session") === "1";

  useEffect(() => {
    // no-op — placeholder if we later want to refresh session
  }, []);

  if (!authed) {
    return <Navigate to={`/auth/login`} replace state={{ from: loc.pathname }} />;
  }
  return <>{children}</>;
}
