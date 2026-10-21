'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services.js';
import { Button } from '@/components/ui/Button.js';
import { Badge } from '@/components/ui/Badge.js';
import { Input } from '@/components/ui/Input.js';
import { Card, CardContent } from '@/components/ui/Card.js';
import { Skeleton } from '@/components/ui/Skeleton.js';
import {
  ArrowLeft,
  Save,
  Send,
  GitBranch,
  BarChart2,
  Trash2,
  Plus,
  HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function FormDetailsPage() {
  const { formId } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: formRes, isLoading } = useQuery({
    queryKey: ['feedback-form', formId],
    queryFn: () => adminService.getForm(formId)
  });

  const form = formRes?.data;
  const isDraft = form?.status === 'draft';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (form) {
      setTitle(form.title || '');
      setDescription(form.description || '');
      setQuestions(form.questions || []);
    }
  }, [form]);

  const updateMutation = useMutation({
    mutationFn: (data) => adminService.updateForm(formId, data),
    onSuccess: () => {
      toast.success('Form changes saved');
      queryClient.invalidateQueries({ queryKey: ['feedback-form', formId] });
      queryClient.invalidateQueries({ queryKey: ['feedback-forms-admin'] });
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update form');
    }
  });

  const publishMutation = useMutation({
    mutationFn: () => adminService.publishForm(formId),
    onSuccess: () => {
      toast.success('Form published');
      queryClient.invalidateQueries({ queryKey: ['feedback-form', formId] });
      queryClient.invalidateQueries({ queryKey: ['feedback-forms-admin'] });
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to publish form');
    }
  });

  const newVersionMutation = useMutation({
    mutationFn: () => adminService.createNewVersion(formId),
    onSuccess: (res) => {
      const newId = res?.data?.form?._id;
      toast.success('New version draft created');
      if (newId) router.push(`/admin/feedback-forms/${newId}`);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to create new version');
    }
  });

  const handleSave = () => {
    updateMutation.mutate({
      title,
      description,
      questions
    });
  };

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
        Feedback form template not found.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/feedback-forms')}
            className="p-1.5"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {form.title}
              </h1>
              <Badge variant="secondary">v{form.version || 1}</Badge>
              <Badge variant={isDraft ? 'neutral' : 'success'} className="capitalize">
                {form.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Form ID: {form._id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isDraft ? (
            <>
              <Button
                variant="outline"
                size="sm"
                loading={updateMutation.isPending}
                onClick={handleSave}
              >
                <Save className="w-4 h-4 mr-1.5" />
                Save Changes
              </Button>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                loading={publishMutation.isPending}
                onClick={() => publishMutation.mutate()}
              >
                <Send className="w-4 h-4 mr-1.5" />
                Publish
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                loading={newVersionMutation.isPending}
                onClick={() => newVersionMutation.mutate()}
              >
                <GitBranch className="w-4 h-4 mr-1.5" />
                Branch New Version
              </Button>
              <Link href={`/admin/feedback-forms/${formId}/responses`}>
                <Button variant="outline" size="sm" className="text-blue-600">
                  <BarChart2 className="w-4 h-4 mr-1.5" />
                  View Responses
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Form Details */}
      <Card className="border-slate-200">
        <CardContent className="p-5 sm:p-6 space-y-4">
          <Input
            label="Template Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={!isDraft}
          />
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Instructions & Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!isDraft}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Questions Display */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Configured Questions ({questions.length})
        </h2>

        {questions.map((q, idx) => (
          <Card key={q.id || idx} className="border-slate-200">
            <CardContent className="p-4 sm:p-5 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-slate-900">{q.text}</span>
                  {q.isRequired && <span className="text-rose-500 font-bold">*</span>}
                </div>
                <Badge variant="outline" className="text-[10px] uppercase">
                  {q.type?.replace('_', ' ')}
                </Badge>
              </div>
              <div className="text-[11px] text-slate-500 pl-8">
                Category: {q.category || 'General'}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
