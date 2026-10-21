'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/authContext.js';
import { StudentHeader } from '@/components/layout/StudentHeader.js';
import { Skeleton } from '@/components/ui/Skeleton.js';

export default function StudentLayout({ children }) {
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (isAdmin) {
        router.push('/admin/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
    );
  }

  if (!isAuthenticated || isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <StudentHeader />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
