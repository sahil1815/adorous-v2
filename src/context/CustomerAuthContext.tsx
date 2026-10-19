'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CustomerProfile } from '@/types';
import {
  getCurrentCustomerAction,
  customerLoginAction,
  customerRegisterAction,
  customerLogoutAction,
} from '@/app/actions/customerAuthActions';

interface CustomerAuthContextType {
  customer: CustomerProfile | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    fullName: string;
    phone: string;
    email?: string;
    password: string;
    district?: string;
    address?: string;
    whatsappUpdates?: boolean;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshCustomer: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCustomer = useCallback(async () => {
    try {
      const active = await getCurrentCustomerAction();
      setCustomer(active);
    } catch (err) {
      console.warn('[CustomerAuthProvider] Error checking session:', err);
      setCustomer(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCustomer();
  }, [refreshCustomer]);

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    const res = await customerLoginAction({ identifier, password });
    if (res.success && res.customer) {
      setCustomer(res.customer);
      setIsLoading(false);
      return { success: true };
    }
    setIsLoading(false);
    return { success: false, error: res.error || 'Login failed.' };
  };

  const register = async (data: {
    fullName: string;
    phone: string;
    email?: string;
    password: string;
    district?: string;
    address?: string;
    whatsappUpdates?: boolean;
  }) => {
    setIsLoading(true);
    const res = await customerRegisterAction(data);
    if (res.success && res.customer) {
      setCustomer(res.customer);
      setIsLoading(false);
      return { success: true };
    }
    setIsLoading(false);
    return { success: false, error: res.error || 'Registration failed.' };
  };

  const logout = async () => {
    setIsLoading(true);
    await customerLogoutAction();
    setCustomer(null);
    setIsLoading(false);
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        isLoading,
        login,
        register,
        logout,
        refreshCustomer,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
}
