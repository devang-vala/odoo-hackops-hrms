"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import axios from "@/lib/axios";

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
        const response = await axios.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
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
    const response = await axios.post("/api/auth/login", { email, password });
    localStorage.setItem("token", response.data.token);
    setUser(response.data.user);
    
    // Redirect based on role
    if (response.data.user.role === "HR") {
      router.push("/admin"); // Keep /admin for now, rename later
    } else {
      router.push("/");
    }
    
    return response.data;
  };

  const register = async (name, email, password, employeeId = null) => {
    const response = await axios.post("/api/auth/register", {
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
    router.push("/");
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);