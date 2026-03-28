"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Toast } from "@/components/ui/shared/ToastNotification";
import { AuthUser } from "../types";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  toast: Toast | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearToast: () => void;
  customRole: string | null;
  setCustomRole: (role: string | null) => void;
}

// ----------------------------------------------------------------
// 1. Create the Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the props interface for clarity
interface AuthProviderProps {
  children: ReactNode;
}

// ----------------------------------------------------------------
// 2. Create the Provider Component

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);
  const [customRole, setCustomRole] = useState<string | null>(null);

  // Clear toast function
  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  // Fetch user data from backend
  const fetchUser = useCallback(async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me`, {
        withCredentials: true,
      });
      const userData: AuthUser = res.data.user;
      setUser(userData);
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setToast(null);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/login`,
        { email, password },
        { withCredentials: true }
      );

      const { token, user: userData } = res.data;
      userData.token = token;
      setUser(userData);

      setToast({
        type: "success",
        message: "Login successful! Redirecting...",
      });

      router.push("/dashboard");
    } catch (error: unknown) {
      console.error("Login error:", error);

      let errorMessage = "Login failed. Please try again.";
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || "Invalid credentials.";
      }

      setToast({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/logout`,
        {},
        {
          withCredentials: true,
        }
      );
      console.log(res);
      setToast({
        type: "success",
        message: "Logged out successfully!",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setIsLoading(false);
      router.push("/login");
    }
  };

  // Refresh user data
  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    await fetchUser();
  }, [fetchUser]);

  // Initial fetch on mount (Only runs once)
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    toast,
    login,
    logout,
    refreshUser,
    clearToast,
    customRole,
    setCustomRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ----------------------------------------------------------------
// 3. Custom Hook to consume the Context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
