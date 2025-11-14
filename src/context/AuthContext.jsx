import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = sessionStorage.getItem('accessToken');
      if (token) {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      // Silent fail - user will be redirected to login if needed
      sessionStorage.removeItem('accessToken');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      const response = await authService.signup(userData);
      setUser(response.user);
      setIsAuthenticated(true);
      toast.success('Account created successfully! 🎉');
      return { success: true };
    } catch (error) {
      const message = error.message || 'Signup failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const signin = async (credentials) => {
    try {
      const response = await authService.signin(credentials);
      setUser(response.user);
      setIsAuthenticated(true);
      toast.success('Welcome back! 👋');
      return { success: true };
    } catch (error) {
      const message = error.message || 'Sign in failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    } catch (error) {
      // Silent fail - clear session regardless
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    signup,
    signin,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
