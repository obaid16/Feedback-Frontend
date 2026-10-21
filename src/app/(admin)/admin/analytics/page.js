'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services.js';
import { Button } from '@/components/ui/Button.js';
import { Badge } from '@/components/ui/Badge.js';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card.js';
import { Skeleton } from '@/components/ui/Skeleton.js';
import { EmptyState } from '@/components/ui/EmptyState.js';
import {
  BarChart3,
  Percent,
  TrendingUp,
  Building2,
  Megaphone,
  Star,
  Users2,
  Calendar,
  CheckCircle2,
  Clock,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

function AdminAnalyticsContent() {
  const searchParams = useSearchParams();
  const initialCampId = searchParams.get('campaignId') || '';

  const [selectedCampaignId, setSelectedCampaignId] = useState(initialCampId);

  // Queries
  const { data: overviewRes, isLoading: loadingOverview } = useQuery({
    queryKey: ['admin-analytics-overview'],
    queryFn: adminService.getAnalyticsOverview
  });

  const { data: deptRes = [], isLoading: loadingDepts } = useQuery({
    queryKey: ['admin-dept-analytics'],
    queryFn: adminService.getDepartmentAnalytics
  });

  const { data: campaignsRes, isLoading: loadingCampaigns } = useQuery({
    queryKey: ['admin-campaigns-list'],
    queryFn: () => adminService.getCampaigns()
  });

  const campaigns = campaignsRes?.data || [];
  const effectiveCampId = selectedCampaignId || campaigns[0]?._id;

  const { data: campaignAnalyticsRes, isLoading: loadingCampaignMetrics } = useQuery({
    queryKey: ['campaign-analytics-detail', effectiveCampId],
    queryFn: () => adminService.getCampaignAnalytics(effectiveCampId),
    enabled: !!effectiveCampId
  });

  const metrics = overviewRes?.metrics || {};
  const campaignData = campaignAnalyticsRes?.data;
  const questionAggs = campaignData?.questionAggregates || [];

  // Department chart data
  const rawDepts = deptRes?.departments || (Array.isArray(deptRes) ? deptRes : []);
  const deptChartData = rawDepts.map((d) => ({
    name: d.code || d.name,
    fullName: d.name,
    responseRate: d.responseRatePercentage || 0,
    submissions: d.totalSubmissions || 0
  }));

  // Colors for charts
  const PIE_COLORS = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'];

  return (
    <div className="space-y-8 max-w-6xl pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Institutional Response Analytics
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Cross-departmental response rates, Likert distributions, question-level aggregates, and cohort participation metrics.
          </p>
        </div>
      </div>

      {/* Top High-Level Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-slate-200">
          <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
            Overall Response Rate
            <Percent className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {metrics.overallResponseRate ?? 0}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Institutional aggregate</div>
        </Card>

        <Card className="p-4 border-slate-200">
          <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
            Decoupled Responses
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {metrics.totalSubmissions ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Completed evaluations</div>
        </Card>

        <Card className="p-4 border-slate-200">
          <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
            Enrolled Students
            <Users2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {metrics.totalStudents ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Eligible respondents</div>
        </Card>

        <Card className="p-4 border-slate-200">
          <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
            Institutional Average
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {metrics.institutionalAverageRating ? `${metrics.institutionalAverageRating}` : 'N/A'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Across synthesized reports</div>
        </Card>
      </div>

      {/* Department-Level Response Rates Chart */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">
                Departmental Completion Index
              </CardTitle>
              <p className="text-xs text-slate-500">
                Participation rates across active academic disciplines.
              </p>
            </div>
            <Badge variant="secondary" className="text-xs">
              {deptRes.length} Departments
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loadingDepts ? (
            <Skeleton className="h-64 rounded-xl" />
          ) : deptChartData.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-xs text-slate-400">
              No department responses recorded yet.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#64748B" fontSize={12} tickLine={false} unit="%" />
                  <Tooltip
                    formatter={(val, name, item) => [`${val}% (${item.payload.submissions} submissions)`, 'Response Rate']}
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

      {/* Granular Campaign Drilldown */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Campaign Question-Level Distribution
            </h2>
            <p className="text-xs text-slate-500">
              Inspect granular item-level averages, response distributions, and option selections.
            </p>
          </div>

          <div className="w-full sm:w-80">
            <select
              value={effectiveCampId || ''}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {campaigns.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Campaign Completion Stats */}
        {campaignData && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 border-slate-200">
              <div className="text-xs text-slate-500">Eligible Recipients</div>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {campaignData.completion?.totalEligible || 0}
              </div>
            </Card>

            <Card className="p-4 border-slate-200">
              <div className="text-xs text-slate-500">Decoupled Submissions</div>
              <div className="text-xl font-bold text-emerald-600 mt-1">
                {campaignData.completion?.submitted || 0}{' '}
                <span className="text-xs text-slate-400 font-normal">
                  ({campaignData.completion?.responseRatePercentage || 0}%)
                </span>
              </div>
            </Card>

            <Card className="p-4 border-slate-200">
              <div className="text-xs text-slate-500">Pending Submissions</div>
              <div className="text-xl font-bold text-amber-600 mt-1">
                {campaignData.completion?.pending || 0}
              </div>
            </Card>
          </div>
        )}

        {/* Questions Aggregates List */}
        {loadingCampaignMetrics ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : questionAggs.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="No responses recorded for this campaign"
            description="As students complete this evaluation campaign, real-time question statistics will populate here."
          />
        ) : (
          <div className="space-y-4">
            {questionAggs.map((agg, idx) => {
              const isRatingType =
                agg.type === 'numeric_rating' || agg.type === 'likert_scale';

              const barData = [1, 2, 3, 4, 5].map((star) => ({
                star: `${star}★`,
                count: agg.distribution?.[star] || 0
              }));

              return (
                <Card key={agg.id || idx} className="border-slate-200">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-slate-900">
                          {agg.text}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {agg.type?.replace('_', ' ')}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {agg.totalResponses} responses
                        </Badge>
                      </div>
                    </div>

                    {/* Chart visualization if rating type */}
                    {isRatingType && (
                      <div className="pt-2 flex flex-col md:flex-row md:items-center gap-6">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center shrink-0 w-32">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">
                            Average Score
                          </div>
                          <div className="text-2xl font-bold text-slate-900 mt-1">
                            {agg.averageRating || '0.00'}
                          </div>
                          <div className="text-[10px] text-slate-500">out of 5.0</div>
                        </div>

                        <div className="flex-1 h-36">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                              <XAxis dataKey="star" stroke="#64748B" fontSize={11} tickLine={false} />
                              <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                              <Tooltip
                                formatter={(val) => [`${val} responses`, 'Count']}
                                contentStyle={{
                                  backgroundColor: '#0F172A',
                                  borderRadius: '6px',
                                  border: 'none',
                                  color: '#fff',
                                  fontSize: '11px'
                                }}
                              />
                              <Bar dataKey="count" fill="#3B82F6" radius={[3, 3, 0, 0]} maxBarSize={36} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {/* Multiple / Single Choice Breakdown */}
                    {(agg.type === 'single_choice' || agg.type === 'multiple_choice') && (
                      <div className="space-y-1.5 pt-1">
                        {Object.entries(agg.optionsCount || {}).map(([opt, count], oIdx) => (
                          <div
                            key={oIdx}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs text-slate-700"
                          >
                            <span>{opt}</span>
                            <span className="font-semibold">{count} selected</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading analytics...</div>}>
      <AdminAnalyticsContent />
    </React.Suspense>
  );
}
