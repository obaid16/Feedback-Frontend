'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services.js';
import { Button } from '@/components/ui/Button.js';
import { Badge } from '@/components/ui/Badge.js';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card.js';
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog.js';
import { Skeleton } from '@/components/ui/Skeleton.js';
import { EmptyState } from '@/components/ui/EmptyState.js';
import {
  FileSpreadsheet,
  Plus,
  Sparkles,
  Eye,
  Edit,
  GitBranch,
  Send,
  Calendar,
  Layers,
  HelpCircle,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function AdminFeedbackFormsPage() {
  const [previewForm, setPreviewForm] = useState(null);
  const queryClient = useQueryClient();

  const { data: formsRes, isLoading } = useQuery({
    queryKey: ['feedback-forms-admin'],
    queryFn: () => adminService.getForms()
  });

  const forms = formsRes?.data || [];

  const publishMutation = useMutation({
    mutationFn: (id) => adminService.publishForm(id),
    onSuccess: () => {
      toast.success('Form template published and ready for campaigns');
      queryClient.invalidateQueries({ queryKey: ['feedback-forms-admin'] });
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to publish form');
    }
  });

  const newVersionMutation = useMutation({
    mutationFn: (id) => adminService.createNewVersion(id),
    onSuccess: (res) => {
      toast.success('New version draft created!');
      queryClient.invalidateQueries({ queryKey: ['feedback-forms-admin'] });
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to create new version');
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Feedback Form Templates
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Build, version, and manage institutional evaluation questionnaires with AI assistance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/feedback-forms/new">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1.5" />
              Create Form
            </Button>
          </Link>
          <Link href="/admin/feedback-forms/new?ai=true">
            <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
              <Sparkles className="w-4 h-4 mr-1.5" />
              AI Assistant
            </Button>
          </Link>
        </div>
      </div>

      {/* Listing */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : forms.length === 0 ? (
        <EmptyState
          icon={FileSpreadsheet}
          title="No feedback forms yet"
          description="Create your first evaluation template manually or generate questions automatically using AI."
          action={
            <Link href="/admin/feedback-forms/new">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1.5" />
                Build First Form
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {forms.map((form) => {
            const isDraft = form.status === 'draft';
            const isPublished = form.status === 'published';

            return (
              <Card key={form._id} className="hover:border-slate-300 transition-colors">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-900 text-base">
                          {form.title}
                        </span>
                        <Badge
                          variant={isPublished ? 'success' : isDraft ? 'neutral' : 'outline'}
                          className="capitalize text-[11px]"
                        >
                          {form.status}
                        </Badge>
                        <Badge variant="secondary" className="text-[11px]">
                          v{form.version || 1}
                        </Badge>
                        {form.aiMetadata?.isAiGenerated && (
                          <Badge variant="primary" className="flex items-center gap-1 text-[11px]">
                            <Sparkles className="w-3 h-3" />
                            AI Synthesized
                          </Badge>
                        )}
                      </div>

                      {form.description && (
                        <p className="text-xs text-slate-500 line-clamp-1 max-w-2xl">
                          {form.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                          {form.questions?.length || 0} questions
                        </span>
                        {form.sections?.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Layers className="w-3.5 h-3.5 text-slate-400" />
                            {form.sections.length} sections
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          Created {format(new Date(form.createdAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewForm(form)}
                        className="text-xs"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Preview
                      </Button>

                      {isDraft && (
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                          loading={publishMutation.isPending}
                          onClick={() => publishMutation.mutate(form._id)}
                        >
                          <Send className="w-3.5 h-3.5 mr-1" />
                          Publish
                        </Button>
                      )}

                      {isPublished && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-slate-600"
                          loading={newVersionMutation.isPending}
                          onClick={() => newVersionMutation.mutate(form._id)}
                          title="Create a new draft version for editing"
                        >
                          <GitBranch className="w-3.5 h-3.5 mr-1" />
                          New Version
                        </Button>
                      )}

                      <Link href={`/admin/feedback-forms/${form._id}`}>
                        <Button variant="ghost" size="sm" className="text-xs text-blue-600">
                          <Edit className="w-3.5 h-3.5 mr-1" />
                          Edit
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

      {/* Interactive Form Preview Modal */}
      <Dialog open={!!previewForm} onClose={() => setPreviewForm(null)} className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{previewForm?.title}</DialogTitle>
            <Badge variant="secondary" className="text-xs">
              v{previewForm?.version || 1}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">{previewForm?.description}</p>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto space-y-5 pr-1">
          {previewForm?.questions?.map((q, idx) => (
            <div
              key={q.id || idx}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-slate-800">
                    {q.text}
                  </span>
                  {q.isRequired && (
                    <span className="text-rose-500 text-xs font-bold">*</span>
                  )}
                </div>
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider shrink-0">
                  {q.type?.replace('_', ' ')}
                </Badge>
              </div>

              {/* Question UI visualization preview */}
              <div className="pt-1 text-xs text-slate-500">
                {q.type === 'likert_scale' || q.type === 'numeric_rating' ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">
                      {q.scaleLabels?.min || '1'}
                    </span>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <div
                          key={num}
                          className="w-8 h-8 rounded-lg border border-slate-300 bg-white flex items-center justify-center text-xs font-medium text-slate-700"
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {q.scaleLabels?.max || '5'}
                    </span>
                  </div>
                ) : q.type === 'single_choice' || q.type === 'multiple_choice' ? (
                  <div className="space-y-1.5">
                    {q.options?.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 text-xs"
                      >
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block" />
                        <span>{opt.label || opt.value}</span>
                      </div>
                    ))}
                  </div>
                ) : q.type === 'yes_no' ? (
                  <div className="flex gap-2">
                    <div className="px-4 py-1.5 rounded-lg border border-slate-200 bg-white text-xs">
                      Yes
                    </div>
                    <div className="px-4 py-1.5 rounded-lg border border-slate-200 bg-white text-xs">
                      No
                    </div>
                  </div>
                ) : (
                  <div className="h-14 rounded-lg border border-dashed border-slate-300 bg-white flex items-center px-3 text-[11px] text-slate-400">
                    {q.type === 'long_text'
                      ? 'Student text response area (multi-line)...'
                      : 'Student short text answer field...'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setPreviewForm(null)}>
            Close Preview
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
