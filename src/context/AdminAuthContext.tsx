'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminLogout } from '@/app/actions/authActions';

interface AdminUser {
  username: string;
  role: string;
  loginTime: string;
}

interface AdminAuthContextType {
  isAuthenticated: boolean;
  adminUser: AdminUser | null;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// The actual authentication is now handled securely on the server via middleware.
// This context is only for managing the UI state of the logged-in user if needed.

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // We assume that if this context mounts inside a protected route, the user is authenticated.
  // In a full setup, we'd fetch the session details from a Server Component and pass it down.
  // For now, we rely on the middleware to protect the routes.
  useEffect(() => {
    // If we're on the admin panel (not the login page), we know the middleware let us through!
    if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
      setIsAuthenticated(true);
      setAdminUser({
        username: 'admin',
        role: 'Atelier Director',
        loginTime: new Date().toISOString(),
      });
    }
    setIsLoading(false);
  }, []);

  const logout = async () => {
    setIsAuthenticated(false);
    setAdminUser(null);
    await adminLogout();
    window.location.href = '/admin/login';
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAuthenticated,
        adminUser,
        logout,
        isLoading,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
