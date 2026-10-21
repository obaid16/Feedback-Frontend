'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services.js';
import { Button } from '@/components/ui/Button.js';
import { Badge } from '@/components/ui/Badge.js';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card.js';
import { Skeleton } from '@/components/ui/Skeleton.js';
import { EmptyState } from '@/components/ui/EmptyState.js';
import { ArrowLeft, BarChart2, HelpCircle } from 'lucide-react';

export default function FormResponsesPage() {
  const { formId } = useParams();
  const router = useRouter();

  const { data: formRes, isLoading } = useQuery({
    queryKey: ['feedback-form', formId],
    queryFn: () => adminService.getForm(formId)
  });

  const form = formRes?.data;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="p-8 text-center text-slate-500">
        Feedback form not found.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/admin/feedback-forms/${formId}`)}
          className="p-1.5"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Form Aggregated Responses
            </h1>
            <Badge variant="secondary">v{form.version || 1}</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {form.title} — Question-level analytical distribution across campaigns.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {form.questions?.map((q, idx) => (
          <Card key={q.id || idx} className="border-slate-200">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-slate-900">{q.text}</span>
                </div>
                <Badge variant="outline" className="text-[10px] uppercase shrink-0">
                  {q.type?.replace('_', ' ')}
                </Badge>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500 flex items-center justify-between">
                <span>Category: {q.category || 'General'}</span>
                <span>Type: {q.type}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
