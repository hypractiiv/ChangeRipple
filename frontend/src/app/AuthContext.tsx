import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  openAuthModal: () => void;
  isAuthModalOpen: boolean;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('changeripple_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('changeripple_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const profile = await api.auth.me();
          setUser(profile);
          localStorage.setItem('changeripple_user', JSON.stringify(profile));
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };

    fetchUser();

    const handleUnauthorized = () => {
      logout();
      setIsAuthModalOpen(true);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [token]);

  const login = async (usernameOrEmail: string, password: string) => {
    const res = await api.auth.login({ usernameOrEmail, password });
    localStorage.setItem('changeripple_token', res.accessToken);
    setToken(res.accessToken);

    const profile: User = {
      id: res.userId,
      username: res.username,
      email: res.email,
      fullName: res.fullName,
      role: res.role,
    };
    setUser(profile);
    localStorage.setItem('changeripple_user', JSON.stringify(profile));
    setIsAuthModalOpen(false);
  };

  const register = async (username: string, email: string, password: string, fullName: string) => {
    const res = await api.auth.register({ username, email, password, fullName });
    localStorage.setItem('changeripple_token', res.accessToken);
    setToken(res.accessToken);

    const profile: User = {
      id: res.userId,
      username: res.username,
      email: res.email,
      fullName: res.fullName,
      role: res.role,
    };
    setUser(profile);
    localStorage.setItem('changeripple_user', JSON.stringify(profile));
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    localStorage.removeItem('changeripple_token');
    localStorage.removeItem('changeripple_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        isAuthModalOpen,
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
