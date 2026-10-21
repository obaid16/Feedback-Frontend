'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { studentService } from '@/lib/api/services.js';
import { Button } from '@/components/ui/Button.js';
import { Badge } from '@/components/ui/Badge.js';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card.js';
import { Skeleton } from '@/components/ui/Skeleton.js';
import { EmptyState } from '@/components/ui/EmptyState.js';
import {
  History,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building2,
  GraduationCap,
  ArrowRight,
  Lock,
  FileCheck
} from 'lucide-react';
import { format } from 'date-fns';

export default function StudentHistoryPage() {
  const { data: campaigns = [], isLoading, error } = useQuery({
    queryKey: ['student-campaigns'],
    queryFn: studentService.getMyCampaigns
  });

  const completedCampaigns = campaigns.filter((c) => c.isSubmitted);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="w-5 h-5 text-indigo-600" />
            <h1 className="text-2xl font-bold text-slate-900">Submission History</h1>
          </div>
          <p className="text-xs text-slate-500">
            A permanent record of your verified submissions. Answers are physically decoupled from your identity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/student/feedback">
            <Button variant="outline" size="sm">
              View Pending Forms
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Anonymity Architecture Notice */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 space-y-1">
          <span className="font-semibold text-slate-800">Physical Anonymity Guarantee</span>
          <p>
            For anonymous campaigns, the system decoupled your user profile from your responses at the exact moment of submission. Neither faculty members nor university administrators can view your individual answers alongside your identity.
          </p>
        </div>
      </div>

      {/* History Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          Failed to load submission history. Please try refreshing.
        </div>
      ) : completedCampaigns.length === 0 ? (
        <EmptyState
          icon={FileCheck}
          title="No completed submissions yet"
          description="You have not submitted any feedback forms during the current academic term."
          action={
            <Link href="/student/feedback">
              <Button size="sm">Complete Assigned Feedback</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {completedCampaigns.map((item) => (
            <Card key={item.campaignId} className="hover:border-slate-300 transition-colors">
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-900 text-base">
                        {item.title}
                      </span>
                      <Badge variant="success" className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Submitted
                      </Badge>
                      {item.anonymityMode === 'anonymous' ? (
                        <Badge variant="neutral" className="flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Anonymous Submission
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Identified Submission</Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-500">
                      {item.faculty && (
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                          {item.faculty.displayName} ({item.faculty.designation})
                        </span>
                      )}
                      {item.course && (
                        <span className="flex items-center gap-1">
                          <span className="font-medium text-slate-700">Course:</span> {item.course.name} ({item.course.code})
                        </span>
                      )}
                      {item.department && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {item.department.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    <div className="text-xs text-slate-400 flex items-center sm:justify-end gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Submitted on
                    </div>
                    <div className="text-xs font-medium text-slate-800 mt-0.5">
                      {item.submittedAt
                        ? format(new Date(item.submittedAt), 'MMMM d, yyyy · h:mm a')
                        : 'Recorded'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
