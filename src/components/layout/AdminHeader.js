'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/authContext.js';
import { Menu, ShieldAlert, Sparkles } from 'lucide-react';
import { ADMIN_NAV_LINKS } from './AdminSidebar.js';

export function AdminHeader({ onOpenMobileMenu }) {
  const pathname = usePathname();
  const { user } = useAuth();

  // Determine current page title
  const currentLink = ADMIN_NAV_LINKS.find(
    (link) => link.href === pathname || (link.href !== '/admin/dashboard' && pathname.startsWith(link.href))
  );
  const pageTitle = currentLink ? currentLink.label : 'Admin Portal';

  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-none">{pageTitle}</h1>
          <p className="text-[11px] text-slate-400 mt-1 hidden sm:block">Faculty Feedback & Intelligence System</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Academic Institution Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Insight Enabled</span>
        </div>

        {/* User initials */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase">
            {user?.name ? user.name.substring(0, 2) : 'AD'}
          </div>
          <div className="hidden sm:block text-left">
            <span className="text-xs font-semibold text-slate-800 block leading-tight">{user?.name || 'Administrator'}</span>
            <span className="text-[10px] text-slate-400 font-mono block">{user?.email}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
