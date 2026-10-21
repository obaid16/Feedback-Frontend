'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { studentService } from '@/lib/api/services.js';
import { useAuth } from '@/lib/auth/authContext.js';
import { Button } from '@/components/ui/Button.js';
import { Badge } from '@/components/ui/Badge.js';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card.js';
import { Skeleton } from '@/components/ui/Skeleton.js';
import { EmptyState } from '@/components/ui/EmptyState.js';
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ArrowRight,
  Calendar,
  AlertCircle,
  FileEdit,
  GraduationCap
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

export default function StudentDashboardPage() {
  const { user } = useAuth();

  const { data: campaigns = [], isLoading, error } = useQuery({
    queryKey: ['student-campaigns'],
    queryFn: studentService.getMyCampaigns
  });

  const pendingCampaigns = campaigns.filter((c) => !c.isSubmitted);
  const completedCampaigns = campaigns.filter((c) => c.isSubmitted);

  // Find nearest pending deadline
  const nearestDeadline = pendingCampaigns.length > 0
    ? [...pendingCampaigns].sort((a, b) => new Date(a.deadline) - new Date(b.deadline))[0]
    : null;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Welcome back, {user?.name || 'Student'}
            </h1>
            <Badge variant="primary" className="text-[10px]">Active Term</Badge>
          </div>
          <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
            Your feedback directly shapes instructional standards. All submissions feature verified physical anonymity.
          </p>
        </div>

        {nearestDeadline && (
          <div className="flex items-center gap-3 p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 shrink-0">
            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-xs">
              <div className="font-semibold">Upcoming Deadline</div>
              <div className="text-amber-800">
                {formatDistanceToNow(new Date(nearestDeadline.deadline), { addSuffix: true })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Feedback</p>
              <h3 className="text-2xl font-extrabold text-blue-600 mt-1">{pendingCampaigns.length}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Forms requiring your response</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <ClipboardList className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Evaluations</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{completedCampaigns.length}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Receipts stored in history</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Anonymity Protocol</p>
              <h3 className="text-base font-bold text-slate-800 mt-1">Physically Decoupled</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Zero student tracking in answers</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Evaluations Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Pending Feedback Campaigns</h2>
            <p className="text-xs text-slate-500">Please submit your feedback prior to the closing deadline.</p>
          </div>
          <Link href="/student/feedback" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
            View All ({campaigns.length})
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-44 w-full" />
          </div>
        ) : pendingCampaigns.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="All evaluations completed!"
            description="You have submitted feedback for all assigned courses. Thank you for your contribution."
            action={
              <Link href="/student/history">
                <Button variant="outline" size="sm">
                  View Submission History
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {pendingCampaigns.map((camp) => (
              <Card key={camp.campaignId} className="hover:border-blue-300 transition-colors flex flex-col justify-between">
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">
                        {camp.course?.code || 'Course'}
                      </span>
                      <CardTitle className="text-base mt-0.5">{camp.title}</CardTitle>
                      <p className="text-xs text-slate-600 mt-1 font-medium">
                        Instructor: {camp.faculty?.displayName || 'Assigned Faculty'}
                      </p>
                    </div>
                    <Badge variant="anonymous">
                      <ShieldCheck className="w-3 h-3" />
                      Anonymous
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="px-5 py-2 text-xs text-slate-500 space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Deadline: {format(new Date(camp.deadline), 'MMM dd, yyyy • h:mm a')}</span>
                  </div>
                  {camp.hasSavedDraft && (
                    <div className="inline-flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-medium border border-amber-200">
                      <FileEdit className="w-3 h-3" />
                      Unsaved draft available
                    </div>
                  )}
                </CardContent>

                <CardFooter className="p-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Takes approx 3-5 min</span>
                  <Link href={`/student/feedback/${camp.campaignId}`}>
                    <Button size="sm" className="gap-1.5">
                      {camp.hasSavedDraft ? 'Resume Draft' : 'Start Feedback'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
