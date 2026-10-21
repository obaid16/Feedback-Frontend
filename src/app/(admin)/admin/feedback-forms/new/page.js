'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services.js';
import { Button } from '@/components/ui/Button.js';
import { Badge } from '@/components/ui/Badge.js';
import { Input } from '@/components/ui/Input.js';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card.js';
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog.js';
import {
  Sparkles,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Eye,
  Save,
  Send,
  HelpCircle,
  Layers,
  ArrowLeft,
  CheckCircle2,
  Wand2
} from 'lucide-react';
import { toast } from 'sonner';

function FormBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shouldOpenAiInitial = searchParams.get('ai') === 'true';

  // State for form metadata
  const [formTitle, setFormTitle] = useState('Faculty Instructional Evaluation 2026');
  const [formDescription, setFormDescription] = useState(
    'Please provide thoughtful and constructive feedback regarding curriculum pacing, clarity, and engagement.'
  );

  // Questions array
  const [questions, setQuestions] = useState([
    {
      id: 'q-1',
      text: 'The instructor explained complex topics clearly and effectively.',
      type: 'likert_scale',
      category: 'Instructional Clarity',
      isRequired: true,
      order: 0,
      scaleMin: 1,
      scaleMax: 5,
      scaleLabels: { min: 'Strongly Disagree', max: 'Strongly Agree' }
    },
    {
      id: 'q-2',
      text: 'Overall, how would you rate this instructor’s effectiveness and responsiveness?',
      type: 'numeric_rating',
      category: 'Overall Rating',
      isRequired: true,
      order: 1,
      scaleMin: 1,
      scaleMax: 5,
      scaleLabels: { min: 'Unsatisfactory', max: 'Exceptional' }
    },
    {
      id: 'q-3',
      text: 'What were the instructor’s greatest teaching strengths or areas where they excelled?',
      type: 'long_text',
      category: 'Qualitative Feedback',
      isRequired: false,
      order: 2
    }
  ]);

  // AI Modal state
  const [aiModalOpen, setAiModalOpen] = useState(shouldOpenAiInitial);
  const [aiPrompt, setAiPrompt] = useState({
    purpose: 'Undergraduate Computer Science mid-term course evaluation',
    departmentName: 'Computer Science & Engineering',
    courseName: 'Algorithms & Data Structures',
    facultyName: 'Assigned Course Faculty',
    questionCount: 6,
    tone: 'constructive, objective, and professional'
  });

  // Preview Modal state
  const [previewOpen, setPreviewOpen] = useState(false);

  // Departments & Courses query for AI dropdowns
  const { data: deptsRes } = useQuery({
    queryKey: ['departments-list'],
    queryFn: () => adminService.getDepartments()
  });
  const departments = deptsRes?.data || [];

  // Mutations
  const generateAiMutation = useMutation({
    mutationFn: (payload) => adminService.generateFormAI(payload),
    onSuccess: (res) => {
      const draft = res?.data?.draft;
      if (draft) {
        if (draft.title) setFormTitle(draft.title);
        if (draft.description) setFormDescription(draft.description);
        if (draft.questions?.length > 0) {
          setQuestions(
            draft.questions.map((q, idx) => ({
              ...q,
              id: q.id || `q-ai-${idx}-${Date.now()}`,
              order: idx
            }))
          );
        }
        toast.success(`Generated ${draft.questions?.length || 0} questions with AI!`);
        setAiModalOpen(false);
      }
    },
    onError: (err) => {
      toast.error(err.message || 'AI generation failed');
    }
  });

  const saveFormMutation = useMutation({
    mutationFn: ({ status }) =>
      adminService.createForm({
        title: formTitle,
        description: formDescription,
        status,
        questions: questions.map((q, idx) => ({ ...q, order: idx })),
        sections: [
          {
            id: 'sec-1',
            title: 'General Evaluation',
            description: 'Evaluate instructional delivery and feedback',
            order: 0
          }
        ]
      }),
    onSuccess: (res, vars) => {
      toast.success(
        vars.status === 'published' ? 'Form published successfully!' : 'Form saved as draft'
      );
      router.push('/admin/feedback-forms');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to save form');
    }
  });

  // Question manipulation helpers
  const handleAddQuestion = () => {
    const newQ = {
      id: `q-${Date.now()}`,
      text: 'New question statement',
      type: 'likert_scale',
      category: 'Instruction',
      isRequired: true,
      order: questions.length,
      scaleMin: 1,
      scaleMax: 5,
      scaleLabels: { min: 'Strongly Disagree', max: 'Strongly Agree' }
    };
    setQuestions([...questions, newQ]);
  };

  const handleDuplicate = (idx) => {
    const target = questions[idx];
    const copy = {
      ...JSON.parse(JSON.stringify(target)),
      id: `q-dup-${Date.now()}`,
      text: `${target.text} (Copy)`
    };
    const next = [...questions];
    next.splice(idx + 1, 0, copy);
    setQuestions(next);
    toast.success('Question duplicated');
  };

  const handleDelete = (idx) => {
    if (questions.length <= 1) {
      toast.error('Questionnaire must have at least one question');
      return;
    }
    const next = questions.filter((_, i) => i !== idx);
    setQuestions(next);
  };

  const handleMove = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= questions.length) return;
    const next = [...questions];
    const [moved] = next.splice(idx, 1);
    next.splice(targetIdx, 0, moved);
    setQuestions(next);
  };

  const updateQuestion = (idx, patch) => {
    const next = [...questions];
    next[idx] = { ...next[idx], ...patch };
    setQuestions(next);
  };

  const handleAddOption = (qIdx) => {
    const next = [...questions];
    const q = next[qIdx];
    const options = q.options ? [...q.options] : [];
    options.push({ label: `Option ${options.length + 1}`, value: `opt_${options.length + 1}` });
    next[qIdx] = { ...q, options };
    setQuestions(next);
  };

  const handleRemoveOption = (qIdx, optIdx) => {
    const next = [...questions];
    const q = next[qIdx];
    const options = q.options.filter((_, i) => i !== optIdx);
    next[qIdx] = { ...q, options };
    setQuestions(next);
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Top Header */}
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
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Feedback Form Builder
            </h1>
            <p className="text-xs text-slate-500">
              Compose, customize, or synthesize accredited student evaluation questionnaires.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAiModalOpen(true)}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            Generate with AI
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewOpen(true)}
          >
            <Eye className="w-4 h-4 mr-1.5" />
            Preview
          </Button>
          <Button
            variant="outline"
            size="sm"
            loading={saveFormMutation.isPending}
            onClick={() => saveFormMutation.mutate({ status: 'draft' })}
          >
            <Save className="w-4 h-4 mr-1.5" />
            Save Draft
          </Button>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            loading={saveFormMutation.isPending}
            onClick={() => saveFormMutation.mutate({ status: 'published' })}
          >
            <Send className="w-4 h-4 mr-1.5" />
            Publish
          </Button>
        </div>
      </div>

      {/* Form Metadata Card */}
      <Card className="border-slate-200">
        <CardContent className="p-5 sm:p-6 space-y-4">
          <Input
            label="Questionnaire Title *"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            className="text-sm font-semibold"
          />
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Instructions & Guidance for Students
            </label>
            <textarea
              rows={2}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Questions ({questions.length})
          </h2>
          <Button size="sm" variant="outline" onClick={handleAddQuestion}>
            <Plus className="w-4 h-4 mr-1" />
            Add Question
          </Button>
        </div>

        {questions.map((q, idx) => (
          <Card key={q.id || idx} className="border-slate-200">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Question #{idx + 1}
                  </span>
                </div>

                {/* Question Actions */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-7 w-7 text-slate-400 hover:text-slate-700"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, -1)}
                    title="Move Up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-7 w-7 text-slate-400 hover:text-slate-700"
                    disabled={idx === questions.length - 1}
                    onClick={() => handleMove(idx, 1)}
                    title="Move Down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-7 w-7 text-slate-400 hover:text-slate-700"
                    onClick={() => handleDuplicate(idx)}
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-7 w-7 text-slate-400 hover:text-rose-600"
                    onClick={() => handleDelete(idx)}
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Question Text */}
              <Input
                label="Question Statement *"
                value={q.text}
                onChange={(e) => updateQuestion(idx, { text: e.target.value })}
                className="text-xs"
              />

              {/* Controls Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Question Type
                  </label>
                  <select
                    value={q.type}
                    onChange={(e) => updateQuestion(idx, { type: e.target.value })}
                    className="w-full h-9 px-2.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="likert_scale">Likert Scale (1-5)</option>
                    <option value="numeric_rating">Numeric Rating (1-5)</option>
                    <option value="single_choice">Single Choice</option>
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="yes_no">Yes / No</option>
                    <option value="short_text">Short Text</option>
                    <option value="long_text">Long Text / Qualitative</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Evaluation Category
                  </label>
                  <input
                    type="text"
                    value={q.category || 'General'}
                    onChange={(e) => updateQuestion(idx, { category: e.target.value })}
                    className="w-full h-9 px-2.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={q.isRequired ?? true}
                      onChange={(e) => updateQuestion(idx, { isRequired: e.target.checked })}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    Mandatory Response
                  </label>
                </div>
              </div>

              {/* Options Editor for Single/Multi Choice */}
              {(q.type === 'single_choice' || q.type === 'multiple_choice') && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                    <span>Configured Options</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs text-blue-600"
                      onClick={() => handleAddOption(idx)}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Option
                    </Button>
                  </div>
                  <div className="space-y-1.5">
                    {(q.options || []).map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={opt.label}
                          onChange={(e) => {
                            const nextOpts = [...q.options];
                            nextOpts[oIdx] = {
                              ...nextOpts[oIdx],
                              label: e.target.value,
                              value: e.target.value
                            };
                            updateQuestion(idx, { options: nextOpts });
                          }}
                          className="flex-1 h-8 px-2.5 rounded border border-slate-200 text-xs bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(idx, oIdx)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        <div className="pt-2">
          <Button variant="outline" className="w-full border-dashed" onClick={handleAddQuestion}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Another Question
          </Button>
        </div>
      </div>

      {/* AI Generator Modal */}
      <Dialog open={aiModalOpen} onClose={() => setAiModalOpen(false)}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <DialogTitle>AI Questionnaire Synthesizer</DialogTitle>
          </div>
          <p className="text-xs text-slate-500">
            Automatically craft accredited evaluation questions tailored to course goals and pedagogical criteria.
          </p>
        </DialogHeader>

        <div className="space-y-4 text-xs">
          <Input
            label="Evaluation Purpose & Objective"
            value={aiPrompt.purpose}
            onChange={(e) => setAiPrompt({ ...aiPrompt, purpose: e.target.value })}
            placeholder="e.g. Mid-term review on clarity, grading equity, and student engagement"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Department
              </label>
              <select
                value={aiPrompt.departmentName}
                onChange={(e) => setAiPrompt({ ...aiPrompt, departmentName: e.target.value })}
                className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-white"
              >
                <option value="General Academics">General Academics</option>
                {departments.map((d) => (
                  <option key={d._id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Target Course / Discipline
              </label>
              <input
                type="text"
                value={aiPrompt.courseName}
                onChange={(e) => setAiPrompt({ ...aiPrompt, courseName: e.target.value })}
                className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-white"
                placeholder="e.g. CS-201 Data Structures"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Number of Questions
              </label>
              <input
                type="number"
                min={3}
                max={15}
                value={aiPrompt.questionCount}
                onChange={(e) => setAiPrompt({ ...aiPrompt, questionCount: Number(e.target.value) })}
                className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-white"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Questionnaire Tone
              </label>
              <select
                value={aiPrompt.tone}
                onChange={(e) => setAiPrompt({ ...aiPrompt, tone: e.target.value })}
                className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-white"
              >
                <option value="constructive and professional">Constructive & Professional</option>
                <option value="academic and rigorous">Academic & Rigorous</option>
                <option value="developmental and supportive">Developmental & Supportive</option>
              </select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setAiModalOpen(false)}>
            Cancel
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            loading={generateAiMutation.isPending}
            onClick={() => generateAiMutation.mutate(aiPrompt)}
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            Generate Questions
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{formTitle}</DialogTitle>
          <p className="text-xs text-slate-500">{formDescription}</p>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-1">
          {questions.map((q, idx) => (
            <div key={q.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="text-xs font-semibold text-slate-800">{q.text}</span>
                {q.isRequired && <span className="text-rose-500 font-bold">*</span>}
              </div>
              <div className="text-[11px] text-slate-400">Type: {q.type}</div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setPreviewOpen(false)}>
            Close Preview
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default function FormBuilderNewPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading form builder...</div>}>
      <FormBuilderContent />
    </React.Suspense>
  );
}
