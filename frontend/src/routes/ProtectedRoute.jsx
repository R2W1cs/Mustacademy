import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function RequireAuth({ children, roles, allowIncompleteProfile = false }) {
  const { user, role, bootstrapped, profileComplete } = useAuth();

  if (!bootstrapped) {
    return (
      <div className="flex h-full min-h-[50vh] w-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-800 border-t-indigo-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles?.length && !roles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  const needsProfile =
    !allowIncompleteProfile &&
    !profileComplete &&
    role !== "admin" &&
    role !== "professor";

  if (needsProfile) {
    return <Navigate to="/profile/setup" replace />;
  }

  return children;
}

export default RequireAuth;
