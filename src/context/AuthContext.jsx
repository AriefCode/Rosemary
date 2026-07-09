import { createContext, useContext, useEffect, useState } from "react";
import * as authService from "../services/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    // Role tidak disimpan di localStorage — selalu diambil dari server
    authService
      .getMe()
      .then((data) => {
        setUser(data);
        setRole(data.role);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
        setRole(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    localStorage.setItem("token", data.token);
    setUser(data.user);
    setRole(data.role);
    return data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    }
    localStorage.removeItem("token");
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout, isPemilik: role === "pemilik" }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus digunakan dalam AuthProvider");
  return ctx;
}
