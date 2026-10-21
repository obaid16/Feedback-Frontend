'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/authContext.js';
import { Button } from '@/components/ui/Button.js';
import {
  GraduationCap,
  ClipboardList,
  History,
  Bell,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils/cn.js';

export function StudentHeader() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Assigned Feedback', href: '/student/dashboard', icon: ClipboardList },
    { label: 'Submission History', href: '/student/history', icon: History },
    { label: 'Notifications', href: '/student/notifications', icon: Bell },
    { label: 'Profile', href: '/student/profile', icon: User }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Student Portal Badge */}
          <div className="flex items-center gap-6">
            <Link href="/student/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900 block leading-tight">
                  Faculty<span className="text-blue-600">Portal</span>
                </span>
                <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider block">
                  Student Workspace
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User info & Logout */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-800">{user?.name || 'Student'}</div>
              <div className="text-[11px] text-slate-500 font-mono">{user?.studentId || user?.email}</div>
            </div>
            <Button variant="outline" size="sm" onClick={logout} className="gap-1.5 text-slate-600 hover:text-red-600">
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </Button>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium',
                  isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={logout} className="text-red-600 hover:bg-red-50">
              Sign Out
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
