import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import api from "../api/axios";

export function RequireAuth({ children, roles }) {
  const { token, role, logout } = useAuth();
  const [status, setStatus] = useState(token ? "checking" : "anonymous");

  useEffect(() => {
    if (!token) {
      setStatus("anonymous");
      return;
    }

    let cancelled = false;
    setStatus("checking");

    api.get("/auth/session")
      .then(() => {
        if (!cancelled) setStatus("authenticated");
      })
      .catch(() => {
        if (!cancelled) {
          logout();
          setStatus("anonymous");
        }
      });

    return () => { cancelled = true; };
  }, [token, logout]);

  if (status === "anonymous") {
    return <Navigate to="/login" replace />;
  }

  if (status === "checking") {
    return (
      <div className="flex h-full min-h-[50vh] w-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-800 border-t-indigo-500" />
      </div>
    );
  }

  if (roles?.length && !roles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default RequireAuth;
