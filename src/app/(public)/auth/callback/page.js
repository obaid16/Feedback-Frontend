'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/authContext.js';
import { toast } from 'sonner';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refetchUser } = useAuth();

  useEffect(() => {
    const status = searchParams.get('status');
    const message = searchParams.get('message');

    if (status === 'error') {
      toast.error(message || 'Authentication failed. Please try again.');
      router.push('/login');
      return;
    }

    // Refresh user session after Google OAuth cookie was set by backend
    refetchUser()
      .then((user) => {
        toast.success('Successfully authenticated with Google');
        if (user?.role === 'admin' || user?.role === 'super_admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/student/dashboard');
        }
      })
      .catch(() => {
        router.push('/login');
      });
  }, [searchParams, router, refetchUser]);

  return (
    <div className="bg-white p-8 rounded-xl shadow-xs border border-slate-200 text-center space-y-4 max-w-sm w-full">
      <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
      <h3 className="text-base font-bold text-slate-900">Verifying Institutional Session</h3>
      <p className="text-xs text-slate-500">Completing secure Google OAuth authentication...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Suspense
        fallback={
          <div className="bg-white p-8 rounded-xl shadow-xs border border-slate-200 text-center space-y-4 max-w-sm w-full">
            <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <h3 className="text-base font-bold text-slate-900">Loading Session</h3>
          </div>
        }
      >
        <AuthCallbackContent />
      </Suspense>
    </div>
  );
}
