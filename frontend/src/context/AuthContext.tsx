import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import axios from 'axios';
import { useToast } from '../components/ui/use-toast';

interface User {
  id: string;
  username: string;
  email: string;
  collegeName: string;
  confessionLink: string;
  subscription?: {
    type: 'free' | 'silver' | 'gold' | 'platinum';
    expiresAt: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, collegeName: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await authAPI.login(email, password);
      const { user: userData, token: newToken } = response.data;
      
      setUser(userData);
      setToken(newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to login';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const register = async (username: string, email: string, password: string, collegeName: string) => {
    try {
      setError(null);
      const response = await authAPI.register(username, email, password, collegeName);
      const { user: userData, token: newToken } = response.data;
      
      setUser(userData);
      setToken(newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      toast({
        title: 'Success',
        description: 'Account created successfully!',
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to register';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 