import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.ts';
import { api, getAuthToken, setAuthToken, clearAuthToken } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; mobile: string; password: string; confirmPassword?: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  authModalOpen: boolean;
  authModalTab: 'login' | 'register';
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  const refreshUser = async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        clearAuthToken();
        setUser(null);
      }
    } catch {
      clearAuthToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    if (res.token && res.user) {
      setAuthToken(res.token);
      setUser(res.user);
      setAuthModalOpen(false);
    }
  };

  const register = async (payload: { name: string; email: string; mobile: string; password: string; confirmPassword?: string }) => {
    const res = await api.register(payload);
    if (res.token && res.user) {
      setAuthToken(res.token);
      setUser(res.user);
      setAuthModalOpen(false);
    }
  };

  const logout = () => {
    clearAuthToken();
    setUser(null);
  };

  const openAuthModal = (tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        loading,
        login,
        register,
        logout,
        refreshUser,
        authModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
