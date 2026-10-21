'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../api/services.js';
import { setClientToken } from '../api/client.js';
import { toast } from 'sonner';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load session on mount
  const checkAuth = useCallback(async () => {
    try {
      // Ensure CSRF token is initialized in browser cookies
      authService.getCsrfToken().catch(() => {});

      const res = await authService.getMe();
      const payload = res?.data || res;
      if (payload && payload.user) {
        setUser(payload.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await authService.login({ email, password });
      const payload = res?.data || res;
      if (payload?.token) {
        setClientToken(payload.token);
      }
      setUser(payload.user);
      toast.success(`Welcome back, ${payload.user.name}`);

      // Role-based routing
      if (payload.user.role === 'admin' || payload.user.role === 'super_admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/student/dashboard');
      }
      return payload.user;
    } catch (err) {
      toast.error(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setClientToken(null);
      setUser(null);
      toast.success('Signed out successfully');
      router.push('/login');
    } catch (err) {
      setClientToken(null);
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
        isStudent: user?.role === 'student',
        isLoading,
        login,
        logout,
        refetchUser: checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
