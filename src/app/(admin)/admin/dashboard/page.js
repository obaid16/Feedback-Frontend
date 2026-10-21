'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services.js';
import { Button } from '@/components/ui/Button.js';
import { Badge } from '@/components/ui/Badge.js';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card.js';
import { Skeleton } from '@/components/ui/Skeleton.js';
import { EmptyState } from '@/components/ui/EmptyState.js';
import {
  Megaphone,
  Users2,
  GraduationCap,
  ClipboardCheck,
  Percent,
  Star,
  ArrowRight,
  Plus,
  Sparkles,
  BellRing,
  AlertCircle,
  Building2,
  BarChart3,
  Calendar,
  Clock
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

export default function AdminDashboardPage() {
  const { data: overviewData, isLoading: loadingOverview } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: adminService.getAdminOverview
  });

  const { data: deptData = [], isLoading: loadingDepts } = useQuery({
    queryKey: ['admin-dept-analytics'],
    queryFn: adminService.getDepartmentAnalytics
  });

  const { data: campaignsData, isLoading: loadingCampaigns } = useQuery({
    queryKey: ['admin-campaigns', { limit: 5 }],
    queryFn: () => adminService.getCampaigns({ limit: 5 })
  });

  const metrics = overviewData?.metrics || {};
  const campaigns = campaignsData?.data || [];

  const rawDepts = deptData?.departments || (Array.isArray(deptData) ? deptData : []);
  const chartData = rawDepts.map((d) => ({
    name: d.code || d.name,
    fullName: d.name,
    responseRate: d.responseRatePercentage || 0,
    submissions: d.totalSubmissions || 0
  }));

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Institutional Overview
            </h1>
            <Badge variant="neutral" className="text-xs">Academic Term 2026</Badge>
          </div>
          <p className="text-xs text-slate-500">
            Real-time campaign telemetry, response compliance, and instructional intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/campaigns">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1.5" />
              New Campaign
            </Button>
          </Link>
          <Link href="/admin/feedback-forms/new">
            <Button variant="outline" size="sm">
              <Sparkles className="w-4 h-4 mr-1.5 text-blue-600" />
              AI Form Builder
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      {loadingOverview ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="p-4 border-slate-200">
            <div className="text-slate-400 text-xs font-medium flex items-center justify-between">
              Active Campaigns
              <Megaphone className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {metrics.activeCampaigns ?? 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Of {metrics.totalCampaigns ?? 0} total
            </div>
          </Card>

          <Card className="p-4 border-slate-200">
            <div className="text-slate-400 text-xs font-medium flex items-center justify-between">
              Eligible Students
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {metrics.totalStudents ?? 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Active accounts</div>
          </Card>

          <Card className="p-4 border-slate-200">
            <div className="text-slate-400 text-xs font-medium flex items-center justify-between">
              Total Responses
              <ClipboardCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {metrics.totalSubmissions ?? 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Decoupled submissions</div>
          </Card>

          <Card className="p-4 border-slate-200">
            <div className="text-slate-400 text-xs font-medium flex items-center justify-between">
              Response Rate
              <Percent className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {metrics.overallResponseRate ?? 0}%
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Target: &gt; 65%</div>
          </Card>

          <Card className="p-4 border-slate-200">
            <div className="text-slate-400 text-xs font-medium flex items-center justify-between">
              Faculty Evaluated
              <Users2 className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {metrics.totalFaculty ?? 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Across {metrics.totalDepartments ?? 0} depts</div>
          </Card>

          <Card className="p-4 border-slate-200">
            <div className="text-slate-400 text-xs font-medium flex items-center justify-between">
              Institution Avg
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {metrics.institutionalAverageRating ? `${metrics.institutionalAverageRating}` : 'N/A'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">On 5.0 scale</div>
          </Card>
        </div>
      )}

      {/* Middle Row: Department Response Rates & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">
                Department Response Rates
              </CardTitle>
              <p className="text-xs text-slate-500">
                Completion percentage by academic discipline for the current evaluation cycle.
              </p>
            </div>
            <Link href="/admin/analytics">
              <Button variant="ghost" size="sm" className="text-xs text-blue-600">
                Detailed Analytics
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            {loadingDepts ? (
              <Skeleton className="h-64 w-full rounded-lg" />
            ) : chartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                No departmental response data recorded yet.
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} />
                    <YAxis
                      domain={[0, 100]}
                      stroke="#64748B"
                      fontSize={12}
                      tickLine={false}
                      unit="%"
                    />
                    <Tooltip
                      formatter={(val, name, item) => [`${val}% (${item.payload.submissions} submissions)`, 'Response Rate']}
                      labelFormatter={(label, items) => items[0]?.payload.fullName || label}
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderRadius: '8px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="responseRate" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Operations Panel */}
        <Card className="border-slate-200 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900">
              Administrative Control
            </CardTitle>
            <p className="text-xs text-slate-500">
              Direct access to automated workflows and system functions.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/feedback-forms/new" className="block">
              <div className="p-3.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 transition-all flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-blue-100 text-blue-700">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800">AI Form Synthesizer</div>
                    <div className="text-[11px] text-slate-500">Generate accredited questionnaires</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
            </Link>

            <Link href="/admin/reports" className="block">
              <div className="p-3.5 rounded-lg border border-slate-200 hover:border-purple-400 hover:bg-purple-50/20 transition-all flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-purple-100 text-purple-700">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Faculty AI Reports</div>
                    <div className="text-[11px] text-slate-500">Generate executive evaluations & PDFs</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
            </Link>

            <Link href="/admin/reminders" className="block">
              <div className="p-3.5 rounded-lg border border-slate-200 hover:border-amber-400 hover:bg-amber-50/20 transition-all flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-amber-100 text-amber-700">
                    <BellRing className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Reminder Center</div>
                    <div className="text-[11px] text-slate-500">Inspect 4-stage automated escalation</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
            </Link>
          </CardContent>

          <CardFooter className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Background reconciliation scheduler running
          </CardFooter>
        </Card>
      </div>

      {/* Active Campaigns Table */}
      <Card className="border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-semibold text-slate-900">
              Active Feedback Campaigns
            </CardTitle>
            <p className="text-xs text-slate-500">
              Campaigns currently accepting evaluations or concluding this term.
            </p>
          </div>
          <Link href="/admin/campaigns">
            <Button variant="outline" size="sm">
              View All Campaigns
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loadingCampaigns ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <EmptyState
              icon={Megaphone}
              title="No active campaigns"
              description="Create a campaign to collect student evaluations for faculty members."
              action={
                <Link href="/admin/campaigns">
                  <Button size="sm">Create First Campaign</Button>
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-3">Campaign Title</th>
                    <th className="py-3 px-3">Faculty / Course</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Responses</th>
                    <th className="py-3 px-3">Deadline</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {campaigns.map((camp) => (
                    <tr key={camp._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-medium text-slate-900">
                        {camp.title}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        <div>{camp.targetFaculty?.displayName || 'Department Faculty'}</div>
                        <div className="text-[11px] text-slate-400">{camp.targetCourse?.name}</div>
                      </td>
                      <td className="py-3 px-3">
                        <Badge
                          variant={
                            camp.status === 'published' || camp.status === 'active'
                              ? 'success'
                              : camp.status === 'closed'
                              ? 'neutral'
                              : 'primary'
                          }
                          className="capitalize text-[11px]"
                        >
                          {camp.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        <span className="font-semibold text-slate-900">
                          {camp.metrics?.totalSubmissions || 0}
                        </span>{' '}
                        / {camp.metrics?.totalEligible || 0}{' '}
                        <span className="text-slate-400">
                          ({camp.metrics?.totalEligible > 0
                            ? Math.round(((camp.metrics.totalSubmissions || 0) / camp.metrics.totalEligible) * 100)
                            : 0}%)
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {camp.deadline ? format(new Date(camp.deadline), 'MMM d, yyyy') : 'No deadline'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link href={`/admin/reminders?campaignId=${camp._id}`}>
                          <Button variant="ghost" size="sm" className="text-blue-600 text-xs">
                            Reminders
                          </Button>
                        </Link>
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
