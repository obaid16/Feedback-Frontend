'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services.js';
import { Button } from '@/components/ui/Button.js';
import { Badge } from '@/components/ui/Badge.js';
import { Input } from '@/components/ui/Input.js';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card.js';
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog.js';
import { Skeleton } from '@/components/ui/Skeleton.js';
import { EmptyState } from '@/components/ui/EmptyState.js';
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  Clock,
  Lock,
  ArrowRight,
  GraduationCap,
  Users2,
  Building2,
  Send,
  AlertTriangle,
  BarChart2
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function AdminCampaignsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [confirmPublishId, setConfirmPublishId] = useState(null);
  const [confirmCloseId, setConfirmCloseId] = useState(null);

  // Form creation state
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    description: '',
    purpose: 'Faculty Instructional Evaluation',
    formId: '',
    targetDepartment: '',
    targetFaculty: '',
    targetCourse: '',
    startDate: new Date().toISOString().split('T')[0],
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    anonymityMode: 'anonymous'
  });

  const queryClient = useQueryClient();

  // Queries
  const { data: campaignsRes, isLoading } = useQuery({
    queryKey: ['admin-campaigns-list', { status: statusFilter }],
    queryFn: () => adminService.getCampaigns({ status: statusFilter })
  });

  const { data: formsRes } = useQuery({
    queryKey: ['feedback-forms-list'],
    queryFn: () => adminService.getForms()
  });

  const { data: deptsRes } = useQuery({
    queryKey: ['departments-list'],
    queryFn: () => adminService.getDepartments()
  });

  const { data: facultyRes } = useQuery({
    queryKey: ['faculty-list'],
    queryFn: () => adminService.getFacultyList()
  });

  const { data: coursesRes } = useQuery({
    queryKey: ['courses-list'],
    queryFn: () => adminService.getCourses()
  });

  const campaigns = campaignsRes?.data || [];
  const forms = formsRes?.data || [];
  const departments = deptsRes?.data || [];
  const facultyList = facultyRes?.data || [];
  const courses = coursesRes?.data || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload) =>
      adminService.createCampaign({
        ...payload,
        anonymity: { mode: payload.anonymityMode }
      }),
    onSuccess: () => {
      toast.success('Campaign created successfully in Draft status');
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns-list'] });
      setCreateModalOpen(false);
      setNewCampaign({
        title: '',
        description: '',
        purpose: 'Faculty Instructional Evaluation',
        formId: '',
        targetDepartment: '',
        targetFaculty: '',
        targetCourse: '',
        startDate: new Date().toISOString().split('T')[0],
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        anonymityMode: 'anonymous'
      });
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to create campaign');
    }
  });

  const publishMutation = useMutation({
    mutationFn: (id) => adminService.publishCampaign(id),
    onSuccess: (data) => {
      toast.success(
        `Campaign published! ${data?.data?.enrolledCount || 0} students assigned and notified.`
      );
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns-list'] });
      setConfirmPublishId(null);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to publish campaign');
    }
  });

  const closeMutation = useMutation({
    mutationFn: (id) => adminService.closeCampaign(id),
    onSuccess: () => {
      toast.success('Campaign closed to further submissions');
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns-list'] });
      setConfirmCloseId(null);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to close campaign');
    }
  });

  const filteredCampaigns = campaigns.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.targetFaculty?.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.targetCourse?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newCampaign.title || !newCampaign.formId || !newCampaign.deadline) {
      toast.error('Please fill in all mandatory fields');
      return;
    }
    createMutation.mutate(newCampaign);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Megaphone className="w-5 h-5 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Feedback Campaigns
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Orchestrate term evaluations, configure targeted cohorts, and track live student completion rates.
          </p>
        </div>

        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Create Campaign
        </Button>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search campaigns by title, faculty, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Campaigns Listing */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No campaigns found"
          description={
            searchTerm || statusFilter
              ? 'No campaigns matched your search or status criteria.'
              : 'Launch your first institutional evaluation campaign.'
          }
          action={
            <Button size="sm" onClick={() => setCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Create Campaign
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredCampaigns.map((camp) => {
            const total = camp.metrics?.totalEligible || 0;
            const submitted = camp.metrics?.totalSubmissions || 0;
            const pct = total > 0 ? Math.round((submitted / total) * 100) : 0;
            const isDraft = camp.status === 'draft';
            const isActive = camp.status === 'published' || camp.status === 'active';
            const isClosed = camp.status === 'closed';

            return (
              <Card key={camp._id} className="hover:border-slate-300 transition-colors">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Left Info */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-900 text-base">
                          {camp.title}
                        </span>
                        <Badge
                          variant={
                            isActive ? 'success' : isDraft ? 'neutral' : 'outline'
                          }
                          className="capitalize text-[11px]"
                        >
                          {camp.status}
                        </Badge>
                        <Badge variant="secondary" className="flex items-center gap-1 text-[11px]">
                          <Lock className="w-3 h-3 text-slate-500" />
                          {camp.anonymity?.mode || 'anonymous'}
                        </Badge>
                      </div>

                      {camp.description && (
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {camp.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-500">
                        {camp.targetFaculty && (
                          <span className="flex items-center gap-1 text-slate-700">
                            <Users2 className="w-3.5 h-3.5 text-slate-400" />
                            {camp.targetFaculty.displayName}
                          </span>
                        )}
                        {camp.targetCourse && (
                          <span className="flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                            {camp.targetCourse.name} ({camp.targetCourse.code})
                          </span>
                        )}
                        {camp.targetDepartment && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            {camp.targetDepartment.name}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          Closes {format(new Date(camp.deadline), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>

                    {/* Middle: Progress stats */}
                    <div className="w-full lg:w-48 shrink-0 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="text-slate-500">Response Rate</span>
                        <span className="font-bold text-slate-900">{pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all"
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1.5 flex justify-between">
                        <span>{submitted} completed</span>
                        <span>{total} eligible</span>
                      </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isDraft && (
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => setConfirmPublishId(camp._id)}
                        >
                          <Send className="w-3.5 h-3.5 mr-1" />
                          Publish
                        </Button>
                      )}

                      {isActive && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-amber-700 hover:bg-amber-50"
                          onClick={() => setConfirmCloseId(camp._id)}
                        >
                          Close
                        </Button>
                      )}

                      <Link href={`/admin/reminders?campaignId=${camp._id}`}>
                        <Button variant="ghost" size="sm" className="text-xs">
                          Reminders
                        </Button>
                      </Link>

                      <Link href={`/admin/analytics?campaignId=${camp._id}`}>
                        <Button variant="ghost" size="sm" className="text-xs text-blue-600">
                          <BarChart2 className="w-3.5 h-3.5 mr-1" />
                          Metrics
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

      {/* Create Campaign Modal */}
      <Dialog open={createModalOpen} onClose={() => setCreateModalOpen(false)}>
        <DialogHeader>
          <DialogTitle>Configure Evaluation Campaign</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Campaign Title *"
            placeholder="e.g., Spring 2026 CS-101 Faculty Feedback"
            value={newCampaign.title}
            onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
            required
          />

          <Input
            label="Purpose Statement"
            placeholder="e.g., Annual instructional review and curriculum enhancement"
            value={newCampaign.purpose}
            onChange={(e) => setNewCampaign({ ...newCampaign, purpose: e.target.value })}
          />

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Feedback Form Template *
            </label>
            <select
              value={newCampaign.formId}
              onChange={(e) => setNewCampaign({ ...newCampaign, formId: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            >
              <option value="">Select a questionnaire template...</option>
              {forms.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.title} (v{f.version || 1}) — {f.questions?.length || 0} questions
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Target Faculty
              </label>
              <select
                value={newCampaign.targetFaculty}
                onChange={(e) => setNewCampaign({ ...newCampaign, targetFaculty: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">All / Departmental</option>
                {facultyList.map((fac) => (
                  <option key={fac._id} value={fac._id}>
                    {fac.displayName} ({fac.designation})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Target Department
              </label>
              <select
                value={newCampaign.targetDepartment}
                onChange={(e) => setNewCampaign({ ...newCampaign, targetDepartment: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Select Department...</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Target Course
              </label>
              <select
                value={newCampaign.targetCourse}
                onChange={(e) => setNewCampaign({ ...newCampaign, targetCourse: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Select Course...</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              type="date"
              label="Evaluation Start Date *"
              value={newCampaign.startDate}
              onChange={(e) => setNewCampaign({ ...newCampaign, startDate: e.target.value })}
              required
            />
            <Input
              type="date"
              label="Submission Deadline *"
              value={newCampaign.deadline}
              onChange={(e) => setNewCampaign({ ...newCampaign, deadline: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Anonymity Mode
            </label>
            <select
              value={newCampaign.anonymityMode}
              onChange={(e) => setNewCampaign({ ...newCampaign, anonymityMode: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="anonymous">Anonymous (Technical Decoupling Guaranteed)</option>
              <option value="confidential">Confidential (Admin visible, Faculty blind)</option>
              <option value="identified">Identified (Author names recorded)</option>
            </select>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending}>
              Create Campaign
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Confirmation Dialog: Publish Campaign */}
      <Dialog open={!!confirmPublishId} onClose={() => setConfirmPublishId(null)}>
        <DialogHeader>
          <DialogTitle>Confirm Campaign Publication</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-xs text-slate-600">
          <p>
            Publishing this campaign will immediately assign it to all eligible students matching the selected department/course cohort, and trigger introductory invitation emails.
          </p>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Once published, student evaluation forms will become accessible and cannot be deleted while submissions are active.
            </span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setConfirmPublishId(null)}>
            Cancel
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            loading={publishMutation.isPending}
            onClick={() => publishMutation.mutate(confirmPublishId)}
          >
            Publish & Enroll Students
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Confirmation Dialog: Close Campaign */}
      <Dialog open={!!confirmCloseId} onClose={() => setConfirmCloseId(null)}>
        <DialogHeader>
          <DialogTitle>Close Campaign</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-xs text-slate-600">
          <p>
            Closing the campaign will prevent further student responses. All pending invitations will be marked completed/concluded.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setConfirmCloseId(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={closeMutation.isPending}
            onClick={() => closeMutation.mutate(confirmCloseId)}
          >
            Close Campaign
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
