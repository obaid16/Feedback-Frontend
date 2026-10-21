'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services.js';
import { Button } from '@/components/ui/Button.js';
import { Badge } from '@/components/ui/Badge.js';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card.js';
import { Skeleton } from '@/components/ui/Skeleton.js';
import {
  ArrowLeft,
  Sparkles,
  Download,
  Printer,
  RotateCw,
  Star,
  Users2,
  Percent,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  Building2,
  GraduationCap,
  Calendar,
  Cpu
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function ReportDetailPage() {
  const { reportId } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: reportRes, isLoading, error } = useQuery({
    queryKey: ['report-detail', reportId],
    queryFn: () => adminService.getReport(reportId)
  });

  const report = reportRes?.data?.report;

  const regenerateMutation = useMutation({
    mutationFn: () => adminService.regenerateReport(reportId),
    onSuccess: (res) => {
      toast.success('Report regenerated successfully');
      queryClient.invalidateQueries({ queryKey: ['report-detail', reportId] });
      queryClient.invalidateQueries({ queryKey: ['admin-reports-list'] });
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to regenerate report');
    }
  });

  const handleDownloadPdf = async () => {
    try {
      toast.info('Downloading official vector PDF...');
      const blob = await adminService.downloadReportPdfBlob(reportId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Faculty_Evaluation_${report?.faculty?.displayName || 'Dossier'}_v${report?.version || 1}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF download complete');
    } catch (err) {
      toast.error('Failed to download PDF');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-8 text-center text-slate-500">
        Report dossier not found.
      </div>
    );
  }

  const isInsufficient = report.status === 'insufficient_data';
  const quant = report.quantitativeStats || {};
  const qual = report.qualitativeSynthesis || {};
  const meta = report.aiMetadata || {};

  // Recharts distribution data
  const distributionData = [1, 2, 3, 4, 5].map((star) => {
    const item = quant.ratingDistribution?.find((d) => d.rating === star);
    return {
      name: `${star} Star${star > 1 ? 's' : ''}`,
      count: item?.count || 0,
      percentage: item?.percentage || 0
    };
  });

  return (
    <div className="space-y-6 max-w-5xl pb-16 print:p-0 print:max-w-none">
      {/* Top Header Actions (hidden in print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 print:hidden">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/reports')}
            className="p-1.5"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Faculty Intelligence Dossier
              </h1>
              <Badge variant="secondary">v{report.version || 1}</Badge>
              <Badge
                variant={report.status === 'completed' ? 'success' : 'neutral'}
                className="capitalize text-xs"
              >
                {report.status?.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Official Evaluation Document · ID: {report._id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="text-xs"
          >
            <Printer className="w-3.5 h-3.5 mr-1 text-slate-500" />
            Print
          </Button>

          <Button
            variant="outline"
            size="sm"
            loading={regenerateMutation.isPending}
            onClick={() => regenerateMutation.mutate()}
            className="text-xs"
          >
            <RotateCw className="w-3.5 h-3.5 mr-1 text-slate-500" />
            Regenerate
          </Button>

          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
            onClick={handleDownloadPdf}
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            Export Vector PDF
          </Button>
        </div>
      </div>

      {/* Insufficient Data State */}
      {isInsufficient && (
        <Card className="border-amber-200 bg-amber-50/50 p-6 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-base">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            Report Synthesis Withheld (Small-Sample Anonymity Threshold)
          </div>
          <p className="text-xs text-amber-800 leading-relaxed max-w-3xl">
            This campaign received {quant.totalResponses || 0} student submissions. To strictly protect respondent identity and comply with institutional privacy policies, AI qualitative synthesis requires a minimum threshold of 5 decoupled submissions.
          </p>
          <div className="text-[11px] text-amber-700">
            Once additional students submit responses, the report will automatically become eligible for complete synthesis.
          </div>
        </Card>
      )}

      {/* Institutional Dossier Header Block */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-widest text-blue-600 uppercase">
              Confidential Academic Evaluation
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {report.faculty?.displayName || 'Faculty Member'}
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {report.faculty?.department?.name || 'Academic Department'}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                {report.campaign?.title || 'Evaluation Campaign'}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Period: {report.reportingPeriod}
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <div className="text-[11px] text-slate-400">Model Confidence</div>
            <Badge
              variant={meta.confidenceScore === 'high' ? 'success' : 'neutral'}
              className="capitalize text-xs mt-0.5"
            >
              {meta.confidenceScore || 'Verified'} Confidence
            </Badge>
          </div>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-slate-400 text-xs font-medium flex items-center justify-between">
              Composite Rating
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {quant.overallAverageRating ? quant.overallAverageRating.toFixed(2) : 'N/A'}{' '}
              <span className="text-xs font-normal text-slate-400">/ 5.0</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Scale 1.0 - 5.0</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-slate-400 text-xs font-medium flex items-center justify-between">
              Sample Submissions
              <Users2 className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {quant.totalResponses || 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Of {quant.totalEligibleStudents || 0} eligible
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-slate-400 text-xs font-medium flex items-center justify-between">
              Response Rate
              <Percent className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {quant.responseRatePercentage || 0}%
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Participation index</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-slate-400 text-xs font-medium flex items-center justify-between">
              AI Architecture
              <Cpu className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-base font-bold text-slate-900 mt-2 truncate">
              {meta.modelUsed || 'OpenAI GPT-4o'}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {meta.tokensUsed ? `${meta.tokensUsed} tokens` : 'Synthesized'}
            </div>
          </div>
        </div>

        {/* Executive Summary Narrative */}
        {qual.executiveSummary && (
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Executive Pedagogical Summary
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-100">
              {qual.executiveSummary}
            </p>
          </div>
        )}
      </div>

      {/* Quantitative Rating Distribution (Recharts) */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-900">
            Student Rating Distribution (1 - 5 Scale)
          </CardTitle>
          <p className="text-xs text-slate-500">
            Quantitative breakdown of responses across Likert and numeric evaluation items.
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
                <Tooltip
                  formatter={(val, name, item) => [`${val} responses (${item.payload.percentage}%)`, 'Count']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Teaching Strengths & Improvement Opportunities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <CardTitle className="text-base font-semibold text-slate-900">
                Core Teaching Strengths
              </CardTitle>
            </div>
            <p className="text-xs text-slate-500">
              Validated pedagogical assets highlighted across student responses.
            </p>
          </CardHeader>
          <CardContent>
            {qual.teachingStrengths?.length > 0 ? (
              <ul className="space-y-2.5">
                {qual.teachingStrengths.map((str, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100 text-xs text-slate-700 flex items-start gap-2.5"
                  >
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-slate-400 py-4 text-center">
                No specific strength items identified in sample.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Improvement Opportunities */}
        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-base font-semibold text-slate-900">
                Areas for Pedagogical Enhancement
              </CardTitle>
            </div>
            <p className="text-xs text-slate-500">
              Constructive suggestions for curriculum pacing, clarity, or accessibility.
            </p>
          </CardHeader>
          <CardContent>
            {qual.improvementOpportunities?.length > 0 ? (
              <ul className="space-y-2.5">
                {qual.improvementOpportunities.map((imp, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-lg bg-blue-50/40 border border-blue-100 text-xs text-slate-700 flex items-start gap-2.5"
                  >
                    <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      →
                    </span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-slate-400 py-4 text-center">
                No recurring constructive recommendations recorded.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recurring Feedback Themes & Sentiment */}
      {qual.recurringThemes?.length > 0 && (
        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              <CardTitle className="text-base font-semibold text-slate-900">
                Synthesized Qualitative Themes
              </CardTitle>
            </div>
            <p className="text-xs text-slate-500">
              Cluster analysis of open-ended qualitative student comments.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {qual.recurringThemes.map((thm, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/40 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-900 truncate">
                      {thm.theme}
                    </span>
                    <Badge
                      variant={
                        thm.sentiment === 'positive'
                          ? 'success'
                          : thm.sentiment === 'constructive'
                          ? 'outline'
                          : 'secondary'
                      }
                      className="capitalize text-[10px]"
                    >
                      {thm.sentiment}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {thm.description}
                  </p>
                </div>
              ))}
            </div>

            {qual.studentSentimentSummary && (
              <div className="p-4 rounded-xl bg-indigo-50/30 border border-indigo-100 text-xs text-indigo-950 mt-4">
                <span className="font-semibold block mb-1">Overall Cohort Sentiment:</span>
                {qual.studentSentimentSummary}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actionable Improvement Roadmap */}
      {qual.actionableRecommendations?.length > 0 && (
        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <CardTitle className="text-base font-semibold text-slate-900">
                Institutional Improvement Actions
              </CardTitle>
            </div>
            <p className="text-xs text-slate-500">
              Concrete steps recommended for departmental chair review and upcoming term syllabus refinement.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {qual.actionableRecommendations.map((act, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-white flex items-start gap-3">
                  <span className="w-5 h-5 rounded-md bg-amber-50 text-amber-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-xs text-slate-700 leading-relaxed">{act}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confidence Caveats & Limitations Footer */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 space-y-1.5">
        <div className="font-semibold text-slate-700 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-slate-500" />
          Data Integrity & Confidence Caveat
        </div>
        <p>
          This evaluation dossier is synthesized using authorized natural language models from decoupled student evaluation responses. Evaluative scores reflect student-reported perceptions and should be interpreted alongside peer reviews, teaching observations, and syllabi alignment. Individual respondent identities cannot be reconstructed.
        </p>
      </div>
    </div>
  );
}
