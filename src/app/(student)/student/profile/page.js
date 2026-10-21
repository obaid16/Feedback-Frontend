'use client';

import React from 'react';
import { useAuth } from '@/lib/auth/authContext.js';
import { Button } from '@/components/ui/Button.js';
import { Badge } from '@/components/ui/Badge.js';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card.js';
import {
  User,
  Mail,
  Building2,
  GraduationCap,
  ShieldCheck,
  Calendar,
  LogOut,
  Lock,
  KeyRound
} from 'lucide-react';
import { format } from 'date-fns';

export default function StudentProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <User className="w-5 h-5 text-indigo-600" />
          <h1 className="text-2xl font-bold text-slate-900">Student Profile</h1>
        </div>
        <p className="text-xs text-slate-500">
          Your verified institutional identity and academic enrollment record.
        </p>
      </div>

      {/* Main Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 border-slate-200 text-center p-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-indigo-50 border-2 border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-2xl mb-4">
            {user?.name?.slice(0, 2)?.toUpperCase() || 'ST'}
          </div>
          <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
          <p className="text-xs text-slate-500">{user?.email}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Badge variant="success" className="text-xs">
              Verified Student
            </Badge>
            <Badge variant="primary" className="text-xs">
              {user?.role?.toUpperCase()}
            </Badge>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              onClick={logout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </Card>

        <Card className="md:col-span-2 border-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900">
              Institutional Enrollment Record
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                  <Mail className="w-3.5 h-3.5" />
                  Institutional Email
                </div>
                <div className="text-sm font-semibold text-slate-800">
                  {user?.email || 'N/A'}
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                  <Building2 className="w-3.5 h-3.5" />
                  Department
                </div>
                <div className="text-sm font-semibold text-slate-800">
                  {user?.department?.name || 'Computer Science & Engineering'}
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Cohort / Academic Class
                </div>
                <div className="text-sm font-semibold text-slate-800">
                  {user?.cohort || 'Class of 2026'}
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Account Enrolled
                </div>
                <div className="text-sm font-semibold text-slate-800">
                  {user?.createdAt
                    ? format(new Date(user.createdAt), 'MMMM yyyy')
                    : 'Current Term'}
                </div>
              </div>
            </div>

            {/* Privacy Section */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 mt-6">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 space-y-1">
                  <span className="font-semibold text-slate-800">
                    Confidentiality & Anonymity Controls
                  </span>
                  <p>
                    Your student record is used exclusively to verify eligibility and assign the correct course evaluations. Anonymous feedback submissions are stored without user IDs or correlation pointers.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
