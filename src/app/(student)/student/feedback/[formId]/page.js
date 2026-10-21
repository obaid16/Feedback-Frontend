'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { studentService } from '@/lib/api/services.js';
import { Button } from '@/components/ui/Button.js';
import { Badge } from '@/components/ui/Badge.js';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card.js';
import { Dialog } from '@/components/ui/Dialog.js';
import { Skeleton } from '@/components/ui/Skeleton.js';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Save,
  Star,
  FileCheck2,
  Calendar,
  Lock,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/cn.js';
import { format } from 'date-fns';

export default function StudentFormRendererPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.formId;

  // Answers state keyed by questionId
  const [answers, setAnswers] = useState({});
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [submissionSuccessData, setSubmissionSuccessData] = useState(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Fetch form definition and student draft
  const { data, isLoading, error } = useQuery({
    queryKey: ['campaign-form', campaignId],
    queryFn: () => studentService.getCampaignForm(campaignId),
    enabled: !!campaignId
  });

  // Prepopulate draft answers if available
  useEffect(() => {
    if (data && data.savedDraft && data.savedDraft.length > 0) {
      const draftMap = {};
      data.savedDraft.forEach((item) => {
        draftMap[item.questionId] = item.answer || {};
      });
      setAnswers((prev) => ({ ...draftMap, ...prev }));
    }
  }, [data]);

  // Group questions by section
  const sections = useMemo(() => {
    if (!data?.form) return [];
    const rawSections = data.form.sections || [];
    const questions = data.form.questions || [];

    if (rawSections.length === 0) {
      return [{ id: 'default', title: 'Course Feedback', questions }];
    }

    return rawSections.map((sec) => ({
      ...sec,
      questions: questions.filter((q) => q.sectionId === sec.id || !q.sectionId)
    }));
  }, [data]);

  const currentSection = sections[currentSectionIndex] || sections[0];
  const totalQuestions = data?.form?.questions?.length || 0;

  // Count answered questions
  const answeredCount = useMemo(() => {
    let count = 0;
    (data?.form?.questions || []).forEach((q) => {
      const ans = answers[q.id];
      if (ans && (ans.ratingValue || ans.textValue?.trim() || ans.selectedOptions?.length || typeof ans.booleanValue === 'boolean')) {
        count++;
      }
    });
    return count;
  }, [answers, data]);

  const progressPercentage = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  // Handle answers update
  const setAnswerField = (questionId, field, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        [field]: value
      }
    }));
  };

  // Draft Save mutation
  const saveDraft = async () => {
    setIsSavingDraft(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([qId, val]) => ({
        questionId: qId,
        answer: val
      }));
      await studentService.saveDraft(campaignId, formattedAnswers);
      toast.success('Progress saved as draft.');
    } catch (err) {
      toast.error(err.message || 'Failed to save draft');
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Submit Feedback mutation
  const submitMutation = useMutation({
    mutationFn: () => {
      const questions = data?.form?.questions || [];
      const formattedPayload = questions.map((q) => {
        const userAns = answers[q.id] || {};
        return {
          questionId: q.id,
          ratingValue: userAns.ratingValue,
          textValue: userAns.textValue,
          selectedOptions: userAns.selectedOptions,
          booleanValue: userAns.booleanValue
        };
      });

      return studentService.submitFeedback(campaignId, formattedPayload);
    },
    onSuccess: (result) => {
      setIsConfirmModalOpen(false);
      setSubmissionSuccessData(result);
      toast.success('Feedback successfully submitted!');
    },
    onError: (err) => {
      setIsConfirmModalOpen(false);
      toast.error(err.message || 'Failed to submit feedback');
    }
  });

  // Validation before going to review or submitting
  const validateCurrentSection = () => {
    const requiredQuestions = (currentSection?.questions || []).filter((q) => q.isRequired);
    for (const q of requiredQuestions) {
      const ans = answers[q.id];
      const hasValue =
        ans &&
        (ans.ratingValue ||
          (ans.textValue && ans.textValue.trim().length > 0) ||
          (ans.selectedOptions && ans.selectedOptions.length > 0) ||
          typeof ans.booleanValue === 'boolean');

      if (!hasValue) {
        toast.error(`Please complete the required question: "${q.text}"`);
        return false;
      }
    }
    return true;
  };

  const handleNextSection = () => {
    if (!validateCurrentSection()) return;

    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsReviewMode(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePreviousSection = () => {
    if (isReviewMode) {
      setIsReviewMode(false);
    } else if (currentSectionIndex > 0) {
      setCurrentSectionIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Already submitted state
  if (data?.isSubmitted && !submissionSuccessData) {
    return (
      <div className="max-w-2xl mx-auto my-12">
        <Card className="text-center p-8 sm:p-12 space-y-5">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Feedback Already Submitted</h2>
            <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
              You submitted your evaluation for <strong>{data?.campaign?.title}</strong> on{' '}
              {data?.submittedAt ? format(new Date(data.submittedAt), 'MMMM dd, yyyy') : 'earlier this term'}.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Anonymous & Decoupled</span>
          </div>
          <div className="pt-4">
            <Button onClick={() => router.push('/student/dashboard')}>Back to Dashboard</Button>
          </div>
        </Card>
      </div>
    );
  }

  // Success Confirmation Screen
  if (submissionSuccessData) {
    return (
      <div className="max-w-2xl mx-auto my-12">
        <Card className="p-8 sm:p-12 text-center space-y-6 border-emerald-200 shadow-md">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Evaluation Recorded</span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">Thank You for Your Feedback!</h2>
            <p className="text-xs text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
              Your responses have been decoupled from your identity and aggregated anonymously into instructional intelligence records.
            </p>
          </div>

          {/* Cryptographic Receipt Box */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 max-w-md mx-auto text-left">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Verification Receipt Code</span>
              <span className="font-semibold text-emerald-600">Verified</span>
            </div>
            <div className="text-base font-mono font-bold text-slate-900 tracking-wider">
              {submissionSuccessData.receiptCode || 'FBP-CONFIRMED'}
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">
              Keep this receipt code for your personal academic records. It verifies participation without exposing your feedback.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Button onClick={() => router.push('/student/dashboard')} className="gap-1.5">
              Return to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={() => router.push('/student/history')}>
              View History
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const { campaign, form } = data || {};

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Campaign Top Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                {campaign?.course?.code || 'Evaluation'}
              </span>
              <Badge variant="anonymous">
                <ShieldCheck className="w-3 h-3 text-blue-600" />
                Physical Anonymity
              </Badge>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">{campaign?.title}</h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Instructor: <strong>{campaign?.faculty?.displayName || 'Assigned Instructor'}</strong>
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={saveDraft} isLoading={isSavingDraft} className="gap-1.5 shrink-0">
            <Save className="w-3.5 h-3.5" />
            Save Draft
          </Button>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Question Progress ({answeredCount} of {totalQuestions} answered)
            </span>
            <span className="font-semibold text-blue-600">{progressPercentage}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Mode 1: Review Screen */}
      {isReviewMode ? (
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">Review Your Evaluation</h2>
            <p className="text-xs text-slate-500 mt-1">
              Please inspect your responses before final submission. Once submitted, answers cannot be edited.
            </p>
          </div>

          <div className="space-y-6">
            {(form?.questions || []).map((q, idx) => {
              const ans = answers[q.id];
              return (
                <div key={q.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                  <div className="font-semibold text-slate-800">
                    {idx + 1}. {q.text} {q.isRequired && <span className="text-red-500">*</span>}
                  </div>
                  <div className="text-slate-600 font-medium pl-3">
                    {q.type === 'likert_scale' || q.type === 'numeric_rating' ? (
                      <span className="text-blue-600 font-bold">
                        {ans?.ratingValue ? `${ans.ratingValue} / 5 Rating` : 'No rating selected'}
                      </span>
                    ) : q.type === 'yes_no' ? (
                      ans?.booleanValue !== undefined ? (ans.booleanValue ? 'Yes' : 'No') : 'Not selected'
                    ) : q.type === 'single_choice' || q.type === 'multiple_choice' ? (
                      ans?.selectedOptions?.length ? ans.selectedOptions.join(', ') : 'No option selected'
                    ) : (
                      ans?.textValue || <span className="text-slate-400 italic">No comments provided</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={handlePreviousSection} className="gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              Edit Answers
            </Button>
            <Button onClick={() => setIsConfirmModalOpen(true)} className="gap-1.5">
              Submit Final Feedback
              <CheckCircle2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        /* Mode 2: Dynamic Question Renderer */
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-8">
          <div>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Section {currentSectionIndex + 1} of {sections.length}
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-1">{currentSection?.title || 'Evaluation Questions'}</h2>
            {currentSection?.description && (
              <p className="text-xs text-slate-500 mt-1">{currentSection.description}</p>
            )}
          </div>

          <div className="space-y-8">
            {(currentSection?.questions || []).map((question, qIdx) => {
              const currentAns = answers[question.id] || {};

              return (
                <div key={question.id} className="space-y-3 pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <label className="text-sm font-semibold text-slate-900 leading-snug">
                      <span className="text-slate-400 mr-1.5">{qIdx + 1}.</span>
                      {question.text}
                      {question.isRequired && <span className="text-red-500 ml-1 font-bold">*</span>}
                    </label>
                    {question.category && (
                      <span className="text-[10px] uppercase font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        {question.category}
                      </span>
                    )}
                  </div>

                  {/* Likert Scale (1 to 5 with Descriptive Labels) */}
                  {question.type === 'likert_scale' && (
                    <div className="space-y-2 pt-1">
                      <div className="grid grid-cols-5 gap-2">
                        {[1, 2, 3, 4, 5].map((val) => {
                          const isSelected = currentAns.ratingValue === val;
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setAnswerField(question.id, 'ratingValue', val)}
                              className={cn(
                                'flex flex-col items-center justify-center py-3 px-1 rounded-lg border text-center transition-all',
                                isSelected
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                              )}
                            >
                              <span className="text-base font-bold">{val}</span>
                              <span className={cn('text-[10px] mt-0.5 leading-tight', isSelected ? 'text-blue-100' : 'text-slate-400')}>
                                {val === 1 && 'Strongly Disagree'}
                                {val === 2 && 'Disagree'}
                                {val === 3 && 'Neutral'}
                                {val === 4 && 'Agree'}
                                {val === 5 && 'Strongly Agree'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Numeric Rating (1 to 5 Stars / Score) */}
                  {question.type === 'numeric_rating' && (
                    <div className="flex items-center gap-3 pt-1">
                      {[1, 2, 3, 4, 5].map((starVal) => {
                        const isFilled = (currentAns.ratingValue || 0) >= starVal;
                        return (
                          <button
                            key={starVal}
                            type="button"
                            onClick={() => setAnswerField(question.id, 'ratingValue', starVal)}
                            className="p-1 text-slate-300 hover:text-amber-400 focus:outline-none transition-colors"
                          >
                            <Star
                              className={cn(
                                'w-7 h-7',
                                isFilled ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                              )}
                            />
                          </button>
                        );
                      })}
                      {currentAns.ratingValue && (
                        <span className="text-xs font-semibold text-slate-600 ml-2">
                          {currentAns.ratingValue} of 5
                        </span>
                      )}
                    </div>
                  )}

                  {/* Single Choice Radio */}
                  {question.type === 'single_choice' && (
                    <div className="space-y-2 pt-1">
                      {(question.options || []).map((opt) => {
                        const isChecked = currentAns.selectedOptions?.[0] === String(opt.value);
                        return (
                          <label
                            key={opt.value}
                            className={cn(
                              'flex items-center gap-3 p-3 rounded-md border text-xs font-medium cursor-pointer transition-colors',
                              isChecked
                                ? 'bg-blue-50 border-blue-400 text-blue-900'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            )}
                          >
                            <input
                              type="radio"
                              name={question.id}
                              checked={isChecked}
                              onChange={() => setAnswerField(question.id, 'selectedOptions', [String(opt.value)])}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span>{opt.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Multiple Choice Checkboxes */}
                  {question.type === 'multiple_choice' && (
                    <div className="space-y-2 pt-1">
                      {(question.options || []).map((opt) => {
                        const currentOpts = currentAns.selectedOptions || [];
                        const isChecked = currentOpts.includes(String(opt.value));
                        return (
                          <label
                            key={opt.value}
                            className={cn(
                              'flex items-center gap-3 p-3 rounded-md border text-xs font-medium cursor-pointer transition-colors',
                              isChecked
                                ? 'bg-blue-50 border-blue-400 text-blue-900'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const newOpts = e.target.checked
                                  ? [...currentOpts, String(opt.value)]
                                  : currentOpts.filter((v) => v !== String(opt.value));
                                setAnswerField(question.id, 'selectedOptions', newOpts);
                              }}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span>{opt.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Yes / No Toggle */}
                  {question.type === 'yes_no' && (
                    <div className="flex gap-3 pt-1">
                      {[true, false].map((boolVal) => {
                        const isSelected = currentAns.booleanValue === boolVal;
                        return (
                          <button
                            key={String(boolVal)}
                            type="button"
                            onClick={() => setAnswerField(question.id, 'booleanValue', boolVal)}
                            className={cn(
                              'px-5 py-2 rounded-md border text-xs font-bold transition-all',
                              isSelected
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            )}
                          >
                            {boolVal ? 'Yes' : 'No'}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Short Text */}
                  {question.type === 'short_text' && (
                    <input
                      type="text"
                      placeholder="Type your response..."
                      value={currentAns.textValue || ''}
                      onChange={(e) => setAnswerField(question.id, 'textValue', e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  )}

                  {/* Long Text */}
                  {question.type === 'long_text' && (
                    <textarea
                      rows={3}
                      placeholder="Provide specific, constructive examples..."
                      value={currentAns.textValue || ''}
                      onChange={(e) => setAnswerField(question.id, 'textValue', e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Stepper Navigation Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={handlePreviousSection}
              disabled={currentSectionIndex === 0}
              className="gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous Section
            </Button>

            <Button onClick={handleNextSection} className="gap-1.5">
              {currentSectionIndex === sections.length - 1 ? 'Review & Submit' : 'Next Section'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <Dialog
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Final Submission"
        description="Are you sure you want to finalize and submit this evaluation?"
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Physical Technical Anonymity
            </div>
            <p>
              Your responses will be stored without student identifiers. A verified cryptographic confirmation code will be issued for your records.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)}>
              Back to Form
            </Button>
            <Button onClick={() => submitMutation.mutate()} isLoading={submitMutation.isPending}>
              Confirm Submission
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
