import React, { createContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { User } from '../types';
import * as api from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('nexus-lms-token');
    if (token) {
      try {
        const userData = await api.getMe();
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user profile, logging out.", error);
        localStorage.removeItem('nexus-lms-token');
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const { access_token } = await api.login(email);
      if (access_token) {
        localStorage.setItem('nexus-lms-token', access_token);
        await loadUser(); // Fetch and set user data
        return true;
      }
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error("Login failed", error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nexus-lms-token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
