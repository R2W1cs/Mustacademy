import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

const persistUser = (user) => {
  if (!user) return;
  if (user.id != null) localStorage.setItem("userId", String(user.id));
  if (user.name) localStorage.setItem("userName", user.name);
  if (user.role) localStorage.setItem("role", user.role);
};

const clearUserStorage = () => {
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
  localStorage.removeItem("role");
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    api.get("/auth/session")
      .then((res) => {
        setUser(res.data.user);
        persistUser(res.data.user);
      })
      .catch(() => {
        setUser(null);
        clearUserStorage();
      })
      .finally(() => setBootstrapped(true));
  }, []);

  const login = (userData) => {
    persistUser(userData);
    setUser(userData);
  };

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
        bootstrapped,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
