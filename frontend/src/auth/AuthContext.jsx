import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { clearSocketToken, setSocketToken } from "../utils/socketAuth";

const AuthContext = createContext(null);

const normalizeUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    profile_complete: Boolean(user.profile_complete),
  };
};

const persistUser = (user) => {
  if (!user) return;
  if (user.id != null) localStorage.setItem("userId", String(user.id));
  if (user.name) localStorage.setItem("userName", user.name);
  if (user.role) localStorage.setItem("role", user.role);
  if (user.profile_complete != null) {
    localStorage.setItem("profileComplete", user.profile_complete ? "1" : "0");
  }
};

const clearUserStorage = () => {
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
  localStorage.removeItem("role");
  localStorage.removeItem("profileComplete");
  clearSocketToken();
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    api.get("/auth/session")
      .then((res) => {
        const next = normalizeUser(res.data.user);
        setUser(next);
        persistUser(next);
      })
      .catch(() => {
        setUser(null);
        clearUserStorage();
      })
      .finally(() => setBootstrapped(true));
  }, []);

  const login = (userData, accessToken) => {
    const next = normalizeUser(userData);
    persistUser(next);
    if (accessToken) setSocketToken(accessToken);
    setUser(next);
  };

  const refreshUser = useCallback(async () => {
    const res = await api.get("/auth/session");
    const next = normalizeUser(res.data.user);
    setUser(next);
    persistUser(next);
    return next;
  }, []);

  const markProfileComplete = useCallback(() => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, profile_complete: true };
      persistUser(next);
      return next;
    });
  }, []);

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // still clear local session
    }
    clearUserStorage();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role,
        isAuthenticated: !!user,
        profileComplete: Boolean(user?.profile_complete),
        bootstrapped,
        login,
        logout,
        refreshUser,
        markProfileComplete,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
