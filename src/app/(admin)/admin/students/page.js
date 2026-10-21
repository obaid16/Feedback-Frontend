'use client';

import React, { useState } from 'react';
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
  GraduationCap,
  Plus,
  Search,
  Building2,
  Mail,
  UserCheck,
  UserX,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function AdminStudentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    department: '',
    cohort: 'Class of 2026',
    role: 'student'
  });

  const queryClient = useQueryClient();

  const { data: usersRes, isLoading } = useQuery({
    queryKey: ['students-list', { department: deptFilter, status: statusFilter, search: searchTerm }],
    queryFn: () =>
      adminService.getUsers({
        role: 'student',
        department: deptFilter,
        status: statusFilter,
        search: searchTerm
      })
  });

  const { data: deptsRes } = useQuery({
    queryKey: ['departments-list'],
    queryFn: () => adminService.getDepartments()
  });

  const students = usersRes?.data || [];
  const departments = deptsRes?.data || [];

  const createMutation = useMutation({
    mutationFn: (data) => adminService.provisionUser(data),
    onSuccess: () => {
      toast.success('Student account provisioned successfully');
      queryClient.invalidateQueries({ queryKey: ['students-list'] });
      setCreateModalOpen(false);
      setNewStudent({
        name: '',
        email: '',
        department: '',
        cohort: 'Class of 2026',
        role: 'student'
      });
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to provision student');
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => adminService.updateUserStatus(id, status),
    onSuccess: () => {
      toast.success('Student status updated');
      queryClient.invalidateQueries({ queryKey: ['students-list'] });
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update student status');
    }
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.email) {
      toast.error('Please enter student name and email');
      return;
    }
    createMutation.mutate(newStudent);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Student Roster
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Enrolled student cohort directory, eligibility provisioning, and account lifecycle status.
          </p>
        </div>

        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Enroll Student
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search students by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="h-10 px-3 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Roster Table */}
      <Card className="border-slate-200">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          ) : students.length === 0 ? (
            <div className="p-12">
              <EmptyState
                icon={GraduationCap}
                title="No students found"
                description={
                  searchTerm || deptFilter
                    ? 'No enrolled students match the search criteria.'
                    : 'Enroll students to assign them feedback evaluation campaigns.'
                }
                action={
                  <Button size="sm" onClick={() => setCreateModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-1.5" />
                    Enroll First Student
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Department / Cohort</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Enrolled</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {students.map((st) => {
                    const isActive = st.status === 'active';
                    return (
                      <tr key={st._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                              {st.name?.slice(0, 2)?.toUpperCase() || 'ST'}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{st.name}</div>
                              <div className="text-[11px] text-slate-500">{st.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          <div>{st.department?.name || 'Computer Science'}</div>
                          <div className="text-[11px] text-slate-400">{st.cohort || 'Class of 2026'}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={isActive ? 'success' : 'neutral'} className="capitalize text-[10px]">
                            {st.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {st.createdAt ? format(new Date(st.createdAt), 'MMM d, yyyy') : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-slate-500 hover:text-slate-800"
                            loading={statusMutation.isPending}
                            onClick={() =>
                              statusMutation.mutate({
                                id: st._id,
                                status: isActive ? 'inactive' : 'active'
                              })
                            }
                          >
                            {isActive ? (
                              <span className="text-amber-600 flex items-center gap-1">
                                <UserX className="w-3.5 h-3.5" />
                                Deactivate
                              </span>
                            ) : (
                              <span className="text-emerald-600 flex items-center gap-1">
                                <UserCheck className="w-3.5 h-3.5" />
                                Activate
                              </span>
                            )}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Provision Student Modal */}
      <Dialog open={createModalOpen} onClose={() => setCreateModalOpen(false)}>
        <DialogHeader>
          <DialogTitle>Enroll New Student</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Full Name *"
            placeholder="e.g. Alice Smith"
            value={newStudent.name}
            onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
            required
          />

          <Input
            type="email"
            label="Institutional Email *"
            placeholder="alice.smith@institution.edu"
            value={newStudent.email}
            onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Department
            </label>
            <select
              value={newStudent.department}
              onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
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

          <Input
            label="Cohort / Academic Year"
            placeholder="Class of 2026"
            value={newStudent.cohort}
            onChange={(e) => setNewStudent({ ...newStudent, cohort: e.target.value })}
          />

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending}>
              Enroll Student
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
