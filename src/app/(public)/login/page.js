'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/authContext.js';
import { authService } from '@/lib/api/services.js';
import { Button } from '@/components/ui/Button.js';
import { Input } from '@/components/ui/Input.js';
import { Dialog } from '@/components/ui/Dialog.js';
import {
  GraduationCap,
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isAdmin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push(isAdmin ? '/admin/dashboard' : '/student/dashboard');
    }
  }, [isAuthenticated, isAdmin, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
    } catch {
      // Handled in login context
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    window.location.href = `${apiUrl}/auth/google`;
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Please enter your institutional email');
      return;
    }
    setIsForgotSubmitting(true);
    try {
      await authService.forgotPassword(forgotEmail);
      toast.success('If this account exists, a reset link has been dispatched to your email.');
      setIsForgotModalOpen(false);
      setForgotEmail('');
    } catch (err) {
      toast.error(err.message || 'Failed to submit reset request');
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  // Demo auto-fill helpers
  const fillStudent = () => {
    setEmail('alice@institution.edu');
    setPassword('StudentPass123!');
  };

  const fillAdmin = () => {
    setEmail('admin@institution.edu');
    setPassword('AdminPass123!');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-700 transition-colors">
            <GraduationCap className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">
            Faculty<span className="text-blue-600">Portal</span>
          </span>
        </Link>
        <h2 className="text-xl font-bold text-slate-900">Sign in to your institutional account</h2>
        <p className="text-xs text-slate-500 mt-1">
          Access your assigned evaluation campaigns or management workspace
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-xl shadow-xs border border-slate-200">
          {/* Google OAuth Login Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-2xs transition-colors mb-6"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Sign in with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400 font-medium uppercase">Or password sign in</span>
            </div>
          </div>

          {/* Email & Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                label="Institutional Email"
                type="email"
                placeholder="you@institution.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full mt-2">
              Sign In
            </Button>
          </form>

          {/* Quick Demo Credentials Autofill */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center mb-2.5">
              Evaluation Demo Quick-Fill
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={fillStudent}
                className="py-1.5 px-2.5 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left text-xs transition-colors"
              >
                <div className="font-semibold text-slate-800">Student Demo</div>
                <div className="text-[10px] text-slate-400 truncate">alice@institution.edu</div>
              </button>
              <button
                type="button"
                onClick={fillAdmin}
                className="py-1.5 px-2.5 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left text-xs transition-colors"
              >
                <div className="font-semibold text-slate-800">Admin Demo</div>
                <div className="text-[10px] text-slate-400 truncate">admin@institution.edu</div>
              </button>
            </div>
          </div>
        </div>

        {/* Security & Privacy notice */}
        <div className="mt-6 text-center text-xs text-slate-500 space-y-1">
          <p className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Feedback submissions are protected by verified physical anonymity.</span>
          </p>
          <p>
            By signing in, you agree to the{' '}
            <Link href="/terms" className="text-blue-600 hover:underline">
              Terms of Use
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Reset Password"
        description="Enter your registered institutional email to receive a password reset link."
      >
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <Input
            label="Institutional Email"
            type="email"
            placeholder="you@institution.edu"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsForgotModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isForgotSubmitting}>
              Send Reset Link
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
