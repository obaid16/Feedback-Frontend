'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services.js';
import { Button } from '@/components/ui/Button.js';
import { Badge } from '@/components/ui/Badge.js';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card.js';
import { Skeleton } from '@/components/ui/Skeleton.js';
import { EmptyState } from '@/components/ui/EmptyState.js';
import {
  Settings,
  ShieldCheck,
  BellRing,
  Globe,
  Lock,
  Clock,
  History,
  CheckCircle2,
  FileCheck,
  Server
} from 'lucide-react';
import { format } from 'date-fns';

export default function AdminSettingsPage() {
  const [auditPage, setAuditPage] = useState(1);

  const { data: settingsRes, isLoading: loadingSettings } = useQuery({
    queryKey: ['institutional-settings'],
    queryFn: adminService.getInstitutionalSettings
  });

  const { data: auditRes, isLoading: loadingAudit } = useQuery({
    queryKey: ['system-audit-logs', { page: auditPage }],
    queryFn: () => adminService.getAuditLogs({ page: auditPage, limit: 15 })
  });

  const settings = settingsRes?.data || {};
  const auditLogs = auditRes?.data || [];
  const auditMeta = auditRes?.meta || {};

  return (
    <div className="space-y-8 max-w-5xl pb-16">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-5 h-5 text-blue-600" />
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Institutional Settings & Audit Trail
          </h1>
        </div>
        <p className="text-xs text-slate-500">
          Core privacy constraints, anonymity threshold configurations, automated reminder cadences, and tamper-resistant audit events.
        </p>
      </div>

      {/* System Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Privacy & Anonymity Parameters */}
        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <CardTitle className="text-sm font-semibold text-slate-900">
                Anonymity & Privacy Policy
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">Minimum Sample for Report Synthesis</span>
              <span className="font-bold text-slate-900">
                {settings.minReportResponses || 5} submissions
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">Physical Decoupling Guarantee</span>
              <Badge variant="success" className="text-[10px]">
                Active (student: null)
              </Badge>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">Authorized Domain Restrictions</span>
              <span className="font-mono text-slate-700">
                {settings.allowedEmailDomains?.join(', ') || '@institution.edu'}
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500">Password Authentication</span>
              <Badge variant={settings.passwordAuthEnabled ? 'primary' : 'neutral'} className="text-[10px]">
                {settings.passwordAuthEnabled ? 'Enabled (Argon2id)' : 'OAuth Only'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Reminder Schedule Defaults */}
        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4 text-amber-600" />
              <CardTitle className="text-sm font-semibold text-slate-900">
                Automated Reminder Cadence
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">Stage 1: Initial Invitation</span>
              <span className="font-semibold text-slate-900">Upon Campaign Publication</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">Stage 2: Gentle Reminder</span>
              <span className="font-semibold text-slate-900">
                T - {settings.reminderDefaults?.firstReminderHours ? `${settings.reminderDefaults.firstReminderHours / 24} days` : '5 days'}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">Stage 3: Urgent Final Call</span>
              <span className="font-semibold text-slate-900">
                T - {settings.reminderDefaults?.secondReminderHours ? `${settings.reminderDefaults.secondReminderHours / 24} days` : '2 days'}
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500">Stage 4: Administrative Escalation</span>
              <span className="font-semibold text-slate-900">T - 24 hours (Low response warning)</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Log Table */}
      <Card className="border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            <div>
              <CardTitle className="text-sm font-semibold text-slate-900">
                Institutional Audit Events
              </CardTitle>
              <p className="text-xs text-slate-500">
                Immutable security logs tracking administrative operations, campaigns, and reports.
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {auditMeta.total || auditLogs.length} Events Logged
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          {loadingAudit ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 rounded-lg" />
              ))}
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={History}
                title="No audit events recorded"
                description="Administrative actions and campaign mutations will be permanently logged here."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                    <th className="py-2.5 px-4">Event Action</th>
                    <th className="py-2.5 px-4">Actor</th>
                    <th className="py-2.5 px-4">Resource</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">IP Address</th>
                    <th className="py-2.5 px-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {auditLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-medium text-slate-900">
                        {log.action}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        <div>{log.actorEmail || 'System Scheduler'}</div>
                        <div className="text-[10px] text-slate-400 capitalize">
                          {log.actorRole || 'automated'}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 capitalize">
                        {log.resourceType}
                      </td>
                      <td className="py-2.5 px-4">
                        <Badge
                          variant={log.status === 'success' ? 'success' : 'neutral'}
                          className="text-[10px] capitalize"
                        >
                          {log.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">
                        {log.ipAddress || '127.0.0.1'}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 text-right text-[11px]">
                        {log.createdAt
                          ? format(new Date(log.createdAt), 'MMM d, yyyy · h:mm a')
                          : 'Recorded'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
