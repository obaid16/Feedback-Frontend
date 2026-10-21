'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/authContext.js';
import {
  LayoutDashboard,
  Megaphone,
  FileSpreadsheet,
  Users2,
  GraduationCap,
  Building2,
  BarChart3,
  Sparkles,
  BellRing,
  Settings,
  LogOut,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils/cn.js';

export const ADMIN_NAV_LINKS = [
  { label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Feedback Campaigns', href: '/admin/campaigns', icon: Megaphone },
  { label: 'Form Builder', href: '/admin/feedback-forms', icon: FileSpreadsheet },
  { label: 'Faculty Directory', href: '/admin/faculty', icon: Users2 },
  { label: 'Student Roster', href: '/admin/students', icon: GraduationCap },
  { label: 'Departments', href: '/admin/departments', icon: Building2 },
  { label: 'Response Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'AI Faculty Reports', href: '/admin/reports', icon: Sparkles },
  { label: 'Reminder Center', href: '/admin/reminders', icon: BellRing },
  { label: 'Settings & Audit', href: '/admin/settings', icon: Settings }
];

export function AdminSidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-bold text-white tracking-tight block">
              Faculty<span className="text-blue-400">Portal</span>
            </span>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase block">
              Academic Admin
            </span>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {ADMIN_NAV_LINKS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center justify-between px-2 py-2">
          <div className="truncate pr-2">
            <p className="text-xs font-semibold text-white truncate">{user?.name || 'Administrator'}</p>
            <p className="text-[10px] text-slate-400 truncate uppercase tracking-wider">{user?.role || 'Admin'}</p>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={onClose} />
          <div className="relative w-64 max-w-xs flex-1 z-10">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
