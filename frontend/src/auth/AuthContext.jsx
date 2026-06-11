import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

const readStoredUser = () => ({
  id: localStorage.getItem("userId"),
  name: localStorage.getItem("userName"),
  role: localStorage.getItem("role") || "student",
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(token ? readStoredUser() : null);

  const login = (jwt, userData = {}) => {
    localStorage.setItem("token", jwt);
    if (userData.id) localStorage.setItem("userId", userData.id);
    if (userData.name) localStorage.setItem("userName", userData.name);
    if (userData.role) localStorage.setItem("role", userData.role);

    setToken(jwt);
    setUser({
      id: userData.id ?? localStorage.getItem("userId"),
      name: userData.name ?? localStorage.getItem("userName"),
      role: userData.role ?? localStorage.getItem("role") ?? "student",
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("role");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, role: user?.role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
