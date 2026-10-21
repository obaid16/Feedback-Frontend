'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { studentService } from '@/lib/api/services.js';
import { Button } from '@/components/ui/Button.js';
import { Badge } from '@/components/ui/Badge.js';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card.js';
import { Skeleton } from '@/components/ui/Skeleton.js';
import { EmptyState } from '@/components/ui/EmptyState.js';
import {
  ClipboardList,
  CheckCircle2,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Clock,
  FileEdit
} from 'lucide-react';
import { format } from 'date-fns';

export default function StudentFeedbackListPage() {
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'submitted'

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['student-campaigns'],
    queryFn: studentService.getMyCampaigns
  });

  const filtered = campaigns.filter((c) => {
    if (filter === 'pending') return !c.isSubmitted;
    if (filter === 'submitted') return c.isSubmitted;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Assigned Course Feedback</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review your pending and completed course evaluations for this semester.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="inline-flex rounded-lg bg-slate-200/80 p-1 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
            }`}
          >
            All ({campaigns.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filter === 'pending' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
            }`}
          >
            Pending ({campaigns.filter((c) => !c.isSubmitted).length})
          </button>
          <button
            onClick={() => setFilter('submitted')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filter === 'submitted' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
            }`}
          >
            Submitted ({campaigns.filter((c) => c.isSubmitted).length})
          </button>
        </div>
      </div>

      {/* Campaign Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={`No ${filter} feedback forms`}
          description={
            filter === 'pending'
              ? 'You have completed all assigned feedback forms.'
              : 'There are no evaluations matching the selected tab.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((camp) => (
            <Card key={camp.campaignId} className="flex flex-col justify-between hover:border-slate-300">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">
                      {camp.course?.code || 'Course'}
                    </span>
                    <CardTitle className="text-base mt-0.5">{camp.title}</CardTitle>
                    <p className="text-xs text-slate-600 mt-1">
                      Faculty: <strong>{camp.faculty?.displayName || 'Assigned Instructor'}</strong>
                    </p>
                  </div>
                  {camp.isSubmitted ? (
                    <Badge variant="success">Submitted</Badge>
                  ) : (
                    <Badge variant="warning">Pending</Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="px-5 py-2 text-xs text-slate-500 space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Deadline: {format(new Date(camp.deadline), 'MMM dd, yyyy • h:mm a')}
                  </span>
                </div>
                {camp.hasSavedDraft && !camp.isSubmitted && (
                  <div className="inline-flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-medium border border-amber-200">
                    <FileEdit className="w-3 h-3" />
                    Draft saved
                  </div>
                )}
              </CardContent>

              <CardFooter className="p-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Anonymous Evaluation</span>
                </div>

                {camp.isSubmitted ? (
                  <Link href="/student/history">
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      View Receipt
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/student/feedback/${camp.campaignId}`}>
                    <Button size="sm" className="gap-1.5">
                      {camp.hasSavedDraft ? 'Resume Draft' : 'Open Form'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
