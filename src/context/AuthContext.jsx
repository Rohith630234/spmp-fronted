import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If token exists, verify current user profile
    const verifyToken = async () => {
      if (token) {
        try {
          const res = await authService.getCurrentUser();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          }
        } catch (error) {
          console.warn('Invalid or expired token, clearing session.');
          logout();
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, [token]);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.success && res.data) {
      const authData = res.data;
      const tokenStr = authData.token;
      const userData = {
        id: authData.id,
        fullName: authData.fullName,
        email: authData.email,
        role: authData.role,
        department: authData.department,
        rollOrEmpId: authData.rollOrEmpId,
        avatarUrl: authData.avatarUrl
      };

      localStorage.setItem('token', tokenStr);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(tokenStr);
      setUser(userData);
      return userData;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (registerData) => {
    const res = await authService.register(registerData);
    if (res.success && res.data) {
      const authData = res.data;
      const tokenStr = authData.token;
      const userData = {
        id: authData.id,
        fullName: authData.fullName,
        email: authData.email,
        role: authData.role,
        department: authData.department,
        rollOrEmpId: authData.rollOrEmpId,
        avatarUrl: authData.avatarUrl
      };

      localStorage.setItem('token', tokenStr);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(tokenStr);
      setUser(userData);
      return userData;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const hasRole = (...roles) => {
    if (!user || !user.role) return false;
    return roles.includes(user.role);
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    loading,
    login,
    register,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
