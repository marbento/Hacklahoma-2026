// frontend/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { initAuthToken, clearAuthToken, register as apiRegister, login as apiLogin } from "../api";

interface AuthState {
  isLoading: boolean;
  isLoggedIn: boolean;
  userId: string | null;
  userName: string | null;
  hasCompletedOnboarding: boolean;
  register: (email: string, name: string) => Promise<void>;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthState>({
  isLoading: true, isLoggedIn: false, userId: null, userName: null,
  hasCompletedOnboarding: false, register: async () => {}, login: async () => {},
  logout: async () => {}, completeOnboarding: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await initAuthToken();
      if (token) {
        setIsLoggedIn(true);
        setHasCompletedOnboarding(true);
      }
      setIsLoading(false);
    })();
  }, []);

  const register = useCallback(async (email: string, name: string) => {
    const res = await apiRegister(email, name);
    setUserId(res.user_id);
    setUserName(res.name);
    setIsLoggedIn(true);
  }, []);

  const login = useCallback(async (email: string) => {
    const res = await apiLogin(email);
    setUserId(res.user_id);
    setUserName(res.name);
    setIsLoggedIn(true);
    setHasCompletedOnboarding(true);
  }, []);

  const logout = useCallback(async () => {
    await clearAuthToken();
    setIsLoggedIn(false);
    setUserId(null);
    setUserName(null);
    setHasCompletedOnboarding(false);
  }, []);

  const completeOnboarding = useCallback(() => {
    setHasCompletedOnboarding(true);
  }, []);

  return (
    <AuthContext.Provider value={{
      isLoading, isLoggedIn, userId, userName, hasCompletedOnboarding,
      register, login, logout, completeOnboarding,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
