'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services.js';
import { Button } from '@/components/ui/Button.js';
import { Badge } from '@/components/ui/Badge.js';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card.js';
import { Skeleton } from '@/components/ui/Skeleton.js';
import {
  ArrowLeft,
  GraduationCap,
  Building2,
  Mail,
  Award,
  Sparkles,
  Star,
  Calendar,
  CheckCircle2,
  FileText,
  BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function FacultyProfileDetailPage() {
  const { facultyId } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Queries
  const { data: facultyRes, isLoading: loadingFaculty } = useQuery({
    queryKey: ['faculty-detail', facultyId],
    queryFn: () => adminService.getFaculty(facultyId)
  });

  const { data: trendsRes, isLoading: loadingTrends } = useQuery({
    queryKey: ['faculty-trends', facultyId],
    queryFn: () => adminService.getFacultyAnalytics(facultyId)
  });

  const { data: reportsRes } = useQuery({
    queryKey: ['faculty-reports-list', facultyId],
    queryFn: () => adminService.getReports({ facultyId })
  });

  const faculty = facultyRes?.data?.faculty;
  const history = trendsRes?.data?.history || [];
  const reports = reportsRes?.data || [];

  // Generate Report Mutation
  const generateReportMutation = useMutation({
    mutationFn: () =>
      adminService.generateReportAI({
        facultyId,
        reportingPeriod: 'Spring 2026'
      }),
    onSuccess: (res) => {
      toast.success(res?.message || 'Report generated successfully!');
      queryClient.invalidateQueries({ queryKey: ['faculty-reports-list', facultyId] });
      queryClient.invalidateQueries({ queryKey: ['faculty-trends', facultyId] });
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to generate report');
    }
  });

  // Average calculation
  const totalReportsCount = history.length;
  const avgRating = totalReportsCount > 0
    ? (history.reduce((acc, h) => acc + (h.overallAverageRating || 0), 0) / totalReportsCount).toFixed(2)
    : 'N/A';

  const chartData = history.map((h) => ({
    period: h.reportingPeriod || 'Period',
    rating: h.overallAverageRating || 0,
    responses: h.totalResponses || 0
  }));

  if (loadingFaculty) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!faculty) {
    return (
      <div className="p-8 text-center text-slate-500">
        Faculty profile not found.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl pb-12">
      {/* Top Navigation */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/admin/faculty')}
          className="p-1.5"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {faculty.displayName}
            </h1>
            <Badge variant="primary">{faculty.designation}</Badge>
            <Badge variant="neutral" className="font-mono text-xs">
              {faculty.employeeId}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {faculty.department?.name || 'Department'} · {faculty.email}
          </p>
        </div>

        <Button
          className="bg-purple-600 hover:bg-purple-700 text-white"
          size="sm"
          loading={generateReportMutation.isPending}
          onClick={() => generateReportMutation.mutate()}
        >
          <Sparkles className="w-4 h-4 mr-1.5" />
          Generate AI Synthesis
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-slate-200">
          <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
            Cumulative Average
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {avgRating} <span className="text-xs font-normal text-slate-400">/ 5.0</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Across all terms</div>
        </Card>

        <Card className="p-4 border-slate-200">
          <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
            Total Evaluations
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {totalReportsCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Completed reporting cycles</div>
        </Card>

        <Card className="p-4 border-slate-200">
          <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
            Assigned Courses
            <GraduationCap className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {faculty.courses?.length || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Active curriculum courses</div>
        </Card>
      </div>

      {/* Longitudinal Rating Trends Recharts Graph */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-900">
            Rating Trajectory & Student Sentiment
          </CardTitle>
          <p className="text-xs text-slate-500">
            Historical student evaluation average ratings by reporting term.
          </p>
        </CardHeader>
        <CardContent>
          {loadingTrends ? (
            <Skeleton className="h-64 rounded-lg" />
          ) : chartData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-slate-400">
              No historical evaluation reports recorded yet for this faculty member.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="period" stroke="#64748B" fontSize={12} tickLine={false} />
                  <YAxis domain={[1, 5]} stroke="#64748B" fontSize={12} tickLine={false} />
                  <Tooltip
                    formatter={(val, name, item) => [`${val} / 5.0 (${item.payload.responses} responses)`, 'Avg Rating']}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#2563EB' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reports Generated */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-900">
            Generated AI Reports & Dossiers
          </CardTitle>
          <p className="text-xs text-slate-500">
            Accredited faculty intelligence reports synthesized from anonymous student feedback.
          </p>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No reports synthesized for this faculty member yet. Click "Generate AI Synthesis" above.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {reports.map((rep) => (
                <div key={rep._id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900">
                        {rep.reportingPeriod} Evaluation Report
                      </span>
                      <Badge
                        variant={rep.status === 'completed' ? 'success' : 'neutral'}
                        className="text-[10px] capitalize"
                      >
                        {rep.status}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        v{rep.version || 1}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>Rating: {rep.quantitativeStats?.overallAverageRating || 'N/A'}/5.0</span>
                      <span>·</span>
                      <span>{rep.quantitativeStats?.totalResponses || 0} responses</span>
                      <span>·</span>
                      <span>
                        Generated{' '}
                        {rep.generatedAt ? format(new Date(rep.generatedAt), 'MMM d, yyyy') : 'Recently'}
                      </span>
                    </div>
                  </div>

                  <Link href={`/admin/reports/${rep._id}`}>
                    <Button variant="outline" size="sm" className="text-xs text-blue-600">
                      Open Dossier
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
