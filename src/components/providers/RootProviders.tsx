"use client";

import React from 'react';
import { AuthProvider } from '../../auth/AuthProvider';
import { PermissionProvider } from '../../auth/PermissionProvider';
import { SessionProvider } from './SessionProvider';
import { ToastContainer } from 'react-toastify';
// @ts-ignore
import 'react-toastify/dist/ReactToastify.css';

interface RootProvidersProps {
  children: React.ReactNode;
}

export function RootProviders({ children }: RootProvidersProps) {
  return (
    <AuthProvider>
      <PermissionProvider>
        <SessionProvider>
          <ToastContainer position="top-right" autoClose={3000} />
          {children}
        </SessionProvider>
      </PermissionProvider>
    </AuthProvider>
  );
}
