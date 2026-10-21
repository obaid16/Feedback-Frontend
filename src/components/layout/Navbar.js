'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/authContext.js';
import { Button } from '@/components/ui/Button.js';
import { GraduationCap, ArrowRight, ShieldCheck } from 'lucide-react';

export function Navbar() {
  const { user, isAuthenticated, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-md bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-700 transition-colors">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-bold text-slate-900 tracking-tight block leading-tight">
              Faculty<span className="text-blue-600">Portal</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase block">
              Institutional Intelligence
            </span>
          </div>
        </Link>

        {/* Center Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <Link href="#features" className="hover:text-blue-600 transition-colors">
            Features
          </Link>
          <Link href="#workflow" className="hover:text-blue-600 transition-colors">
            Evaluation Workflow
          </Link>
          <Link href="#anonymity" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Anonymity Policy
          </Link>
          <Link href="/privacy" className="hover:text-blue-600 transition-colors">
            Privacy
          </Link>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link href={isAdmin ? '/admin/dashboard' : '/student/dashboard'}>
              <Button size="sm" className="gap-1.5">
                Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/login">
                <Button size="sm" className="gap-1.5">
                  Access Portal
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
