'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services.js';
import { Button } from '@/components/ui/Button.js';
import { Badge } from '@/components/ui/Badge.js';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card.js';
import { Skeleton } from '@/components/ui/Skeleton.js';
import { EmptyState } from '@/components/ui/EmptyState.js';
import {
  BellRing,
  RotateCw,
  Send,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Users2,
  Mail,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

function AdminRemindersContent() {
  const searchParams = useSearchParams();
  const initialCampaignId = searchParams.get('campaignId') || '';

  const [selectedCampaignId, setSelectedCampaignId] = useState(initialCampaignId);
  const queryClient = useQueryClient();

  // Load published/active campaigns
  const { data: campaignsRes, isLoading: loadingCampaigns } = useQuery({
    queryKey: ['admin-campaigns-reminders'],
    queryFn: () => adminService.getCampaigns()
  });

  const campaigns = campaignsRes?.data || [];
  const effectiveCampaignId = selectedCampaignId || campaigns[0]?._id;

  // Load reminder status for the selected campaign
  const { data: reminderStatusRes, isLoading: loadingStatus } = useQuery({
    queryKey: ['campaign-reminders-status', effectiveCampaignId],
    queryFn: () => adminService.getCampaignReminderStatus(effectiveCampaignId),
    enabled: !!effectiveCampaignId
  });

  const status = reminderStatusRes?.data;

  // Mutation to trigger manual reconciliation
  const reconcileMutation = useMutation({
    mutationFn: () => adminService.triggerReminderReconciliation(),
    onSuccess: (res) => {
      toast.success(
        `Scheduler reconciliation executed. ${res?.data?.processed || 0} pending notifications processed.`
      );
      queryClient.invalidateQueries({ queryKey: ['campaign-reminders-status'] });
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns-reminders'] });
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to trigger reconciliation');
    }
  });

  return (
    <div className="space-y-6 max-w-5xl pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BellRing className="w-5 h-5 text-amber-600" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Reminder & Escalation Center
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Four-stage automated delivery pipeline, overdue student suppression, and background queue reconciliation.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="text-blue-600 border-blue-200 hover:bg-blue-50"
          loading={reconcileMutation.isPending}
          onClick={() => reconcileMutation.mutate()}
        >
          <RotateCw className="w-4 h-4 mr-1.5" />
          Trigger Reconciliation
        </Button>
      </div>

      {/* Campaign Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="text-xs font-semibold text-slate-700">
          Target Campaign Telemetry:
        </div>
        <div className="w-full sm:w-96">
          <select
            value={effectiveCampaignId || ''}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {campaigns.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title} ({c.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4-Stage Visual Automated Pipeline */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-900">
            Automated Delivery Lifecycle Pipeline
          </CardTitle>
          <p className="text-xs text-slate-500">
            Recipients automatically transition between reminder stages. When a student submits, their reminder queue is instantly suppressed.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {/* Stage 1 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Stage 1
                </span>
                <Badge variant="primary" className="text-[10px]">
                  Invitation
                </Badge>
              </div>
              <div className="text-xl font-bold text-slate-900">
                {status ? status.invited : 0}
              </div>
              <div className="text-[11px] text-slate-500">
                Initial announcement dispatched upon campaign publication.
              </div>
            </div>

            {/* Stage 2 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Stage 2
                </span>
                <Badge variant="neutral" className="text-[10px]">
                  Reminder 1
                </Badge>
              </div>
              <div className="text-xl font-bold text-slate-900">
                {status ? status.reminder1Sent : 0}
              </div>
              <div className="text-[11px] text-slate-500">
                Scheduled gentle reminder (T - 5 days to deadline).
              </div>
            </div>

            {/* Stage 3 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Stage 3
                </span>
                <Badge variant="secondary" className="text-[10px]">
                  Reminder 2
                </Badge>
              </div>
              <div className="text-xl font-bold text-slate-900">
                {status ? status.reminder2Sent : 0}
              </div>
              <div className="text-[11px] text-slate-500">
                Urgent closing notification (T - 2 days to deadline).
              </div>
            </div>

            {/* Stage 4 */}
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  Stage 4
                </span>
                <Badge variant="outline" className="text-[10px] text-amber-800 border-amber-300">
                  Escalation
                </Badge>
              </div>
              <div className="text-xl font-bold text-amber-900">
                {status ? status.escalated : 0}
              </div>
              <div className="text-[11px] text-amber-700">
                Admin digest notification when participation falls below target threshold.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Participation Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border-slate-200">
          <div className="text-xs text-slate-400 font-medium">Total Eligible Cohort</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {status ? status.totalEligible : 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Enrolled student audience</div>
        </Card>

        <Card className="p-5 border-slate-200">
          <div className="text-xs text-slate-400 font-medium">Completed Submissions</div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">
            {status ? status.submitted : 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {status ? `${status.completionPercentage}% response rate` : '0%'}
          </div>
        </Card>

        <Card className="p-5 border-slate-200">
          <div className="text-xs text-slate-400 font-medium">Pending Unsubmitted</div>
          <div className="text-2xl font-bold text-amber-600 mt-2">
            {status ? status.pendingTotal : 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Active in reminder pipeline</div>
        </Card>
      </div>

      {/* Suppression & Anonymity Guarantee Notice */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 space-y-1">
          <span className="font-semibold text-slate-800">
            Automated Suppression Guarantee
          </span>
          <p>
            The moment a student submits their evaluation, the backend immediately transitions their recipient record to "Submitted". This permanently removes them from upcoming reminder cron jobs, preventing redundant follow-up emails while protecting anonymity.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminRemindersPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading reminder metrics...</div>}>
      <AdminRemindersContent />
    </React.Suspense>
  );
}
