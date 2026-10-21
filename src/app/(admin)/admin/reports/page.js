'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services.js';
import { Button } from '@/components/ui/Button.js';
import { Badge } from '@/components/ui/Badge.js';
import { Input } from '@/components/ui/Input.js';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card.js';
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog.js';
import { Skeleton } from '@/components/ui/Skeleton.js';
import { EmptyState } from '@/components/ui/EmptyState.js';
import {
  Sparkles,
  Plus,
  FileText,
  Star,
  Users2,
  Calendar,
  Download,
  AlertTriangle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function AdminReportsListPage() {
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [newReportParams, setNewReportParams] = useState({
    facultyId: '',
    campaignId: '',
    reportingPeriod: 'Spring 2026'
  });

  const queryClient = useQueryClient();

  const { data: reportsRes, isLoading } = useQuery({
    queryKey: ['admin-reports-list'],
    queryFn: () => adminService.getReports()
  });

  const { data: facultyRes } = useQuery({
    queryKey: ['faculty-list'],
    queryFn: () => adminService.getFacultyList()
  });

  const { data: campaignsRes } = useQuery({
    queryKey: ['admin-campaigns-list'],
    queryFn: () => adminService.getCampaigns()
  });

  const reports = reportsRes?.data || [];
  const facultyList = facultyRes?.data?.faculty || [];
  const campaigns = campaignsRes?.data || [];

  const generateMutation = useMutation({
    mutationFn: (data) => adminService.generateReportAI(data),
    onSuccess: (res) => {
      toast.success(res?.message || 'Report generated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-reports-list'] });
      setGenerateModalOpen(false);
      setNewReportParams({
        facultyId: '',
        campaignId: '',
        reportingPeriod: 'Spring 2026'
      });
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to generate report');
    }
  });

  const handleDownloadPdf = async (reportId, facultyName) => {
    try {
      toast.info('Preparing PDF document...');
      const blob = await adminService.downloadReportPdfBlob(reportId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Faculty_Evaluation_${facultyName || 'Report'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded');
    } catch (err) {
      toast.error('Failed to download PDF');
    }
  };

  const handleGenerateSubmit = (e) => {
    e.preventDefault();
    if (!newReportParams.facultyId || !newReportParams.campaignId) {
      toast.error('Please select both faculty member and campaign');
      return;
    }
    generateMutation.mutate(newReportParams);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              AI Faculty Intelligence Reports
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Accredited faculty evaluation dossiers synthesized with OpenAI GPT-4o, anonymized feedback excerpts, and institutional benchmarks.
          </p>
        </div>

        <Button
          className="bg-purple-600 hover:bg-purple-700 text-white"
          onClick={() => setGenerateModalOpen(true)}
        >
          <Sparkles className="w-4 h-4 mr-1.5" />
          Synthesize New Report
        </Button>
      </div>

      {/* Reports List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No faculty reports generated yet"
          description="Synthesize an AI evaluation dossier from student feedback submissions."
          action={
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white"
              size="sm"
              onClick={() => setGenerateModalOpen(true)}
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              Synthesize First Report
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {reports.map((rep) => {
            const isCompleted = rep.status === 'completed';
            const isInsufficient = rep.status === 'insufficient_data';
            const stats = rep.quantitativeStats || {};

            return (
              <Card key={rep._id} className="hover:border-slate-300 transition-colors">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    {/* Left Details */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-900 text-base">
                          {rep.faculty?.displayName || 'Faculty Member'}
                        </span>
                        <Badge
                          variant={
                            isCompleted ? 'success' : isInsufficient ? 'outline' : 'neutral'
                          }
                          className="capitalize text-[11px]"
                        >
                          {rep.status?.replace('_', ' ')}
                        </Badge>
                        <Badge variant="secondary" className="text-[11px]">
                          {rep.reportingPeriod}
                        </Badge>
                        <Badge variant="neutral" className="text-[11px]">
                          v{rep.version || 1}
                        </Badge>
                      </div>

                      <div className="text-xs text-slate-500">
                        Campaign:{' '}
                        <span className="font-medium text-slate-700">
                          {rep.campaign?.title || 'Instructional Evaluation'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Users2 className="w-3.5 h-3.5 text-slate-400" />
                          {stats.totalResponses || 0} student responses ({stats.responseRatePercentage || 0}% rate)
                        </span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          Synthesized {rep.generatedAt ? format(new Date(rep.generatedAt), 'MMM d, yyyy') : 'Recent'}
                        </span>
                      </div>
                    </div>

                    {/* Middle Score */}
                    {isCompleted && (
                      <div className="px-5 py-3 rounded-xl bg-purple-50/50 border border-purple-100 shrink-0 text-center">
                        <div className="text-[11px] text-purple-700 font-semibold uppercase tracking-wider flex items-center justify-center gap-1">
                          <Star className="w-3 h-3 fill-purple-600 text-purple-600" />
                          Composite Rating
                        </div>
                        <div className="text-2xl font-bold text-slate-900 mt-0.5">
                          {stats.overallAverageRating ? stats.overallAverageRating.toFixed(2) : 'N/A'}{' '}
                          <span className="text-xs font-normal text-slate-400">/ 5.0</span>
                        </div>
                      </div>
                    )}

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      {isCompleted && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs text-slate-700"
                          onClick={() => handleDownloadPdf(rep._id, rep.faculty?.displayName)}
                        >
                          <Download className="w-3.5 h-3.5 mr-1 text-slate-500" />
                          PDF
                        </Button>
                      )}

                      <Link href={`/admin/reports/${rep._id}`}>
                        <Button size="sm" variant="outline" className="text-xs text-blue-600">
                          View Dossier
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Generate Report Modal */}
      <Dialog open={generateModalOpen} onClose={() => setGenerateModalOpen(false)}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <DialogTitle>Synthesize Faculty AI Report</DialogTitle>
          </div>
          <p className="text-xs text-slate-500">
            Synthesizes quantitative metrics, recurring qualitative themes, and pedagogical recommendations from student submissions.
          </p>
        </DialogHeader>

        <form onSubmit={handleGenerateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Faculty Member *
            </label>
            <select
              value={newReportParams.facultyId}
              onChange={(e) => setNewReportParams({ ...newReportParams, facultyId: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
              required
            >
              <option value="">Select Faculty Profile...</option>
              {facultyList.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.displayName} ({f.department?.name || f.designation})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Feedback Campaign Source *
            </label>
            <select
              value={newReportParams.campaignId}
              onChange={(e) => setNewReportParams({ ...newReportParams, campaignId: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
              required
            >
              <option value="">Select Completed or Active Campaign...</option>
              {campaigns.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title} ({c.metrics?.totalSubmissions || 0} submissions)
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Academic Reporting Term *"
            placeholder="e.g. Spring 2026"
            value={newReportParams.reportingPeriod}
            onChange={(e) => setNewReportParams({ ...newReportParams, reportingPeriod: e.target.value })}
            required
          />

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Small-Sample Threshold Protection: Reports require at least 5 decoupled student submissions to protect student anonymity before synthesis is released.
            </span>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setGenerateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white"
              loading={generateMutation.isPending}
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              Synthesize Report
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
