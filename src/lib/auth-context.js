"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import api from "@/lib/axios";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await api.get("/api/auth/me");
        setUser(response.data.user);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await api.post("/api/auth/login", { email, password });
    localStorage.setItem("token", response.data.token);
    setUser(response.data.user);
    
    // ✅ Don't redirect if first login - let component handle it
    if (! response.data.user.isFirstLogin) {
      if (response.data.user.role === "HR") {
        router.push("/admin");
      } else {
        router.push("/employee");
      }
    }
    
    return response.data;
  };

  const register = async (name, email, password, employeeId = null) => {
    const response = await api.post("/api/auth/register", {
      name,
      email,
      password,
      employeeId,
    });
    return login(email, password);
  };

  const loginWithGoogle = () => {
    if (pathname === "/auth/callback") return;
    window.location.href = "/api/auth/google";
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/auth");
  };

  // ✅ Add method to update user after password change
  const refreshUser = async () => {
    try {
      const response = await api.get("/api/auth/me");
      setUser(response.data.user);
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        register, 
        loginWithGoogle, 
        logout, 
        loading,
        refreshUser, // ✅ Export this
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);