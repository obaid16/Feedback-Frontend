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
  Users2,
  Plus,
  Search,
  Building2,
  GraduationCap,
  Mail,
  ArrowRight,
  Sparkles,
  BarChart3,
  BadgeCheck
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminFacultyPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [newFaculty, setNewFaculty] = useState({
    displayName: '',
    email: '',
    employeeId: '',
    department: '',
    designation: 'Assistant Professor'
  });

  const queryClient = useQueryClient();

  const { data: facultyRes, isLoading } = useQuery({
    queryKey: ['faculty-list', { departmentId: deptFilter }],
    queryFn: () => adminService.getFacultyList({ departmentId: deptFilter })
  });

  const { data: deptsRes } = useQuery({
    queryKey: ['departments-list'],
    queryFn: () => adminService.getDepartments()
  });

  const facultyList = facultyRes?.data?.faculty || [];
  const departments = deptsRes?.data || [];

  const createMutation = useMutation({
    mutationFn: (data) => adminService.createFaculty(data),
    onSuccess: () => {
      toast.success('Faculty member added to directory');
      queryClient.invalidateQueries({ queryKey: ['faculty-list'] });
      setCreateModalOpen(false);
      setNewFaculty({
        displayName: '',
        email: '',
        employeeId: '',
        department: '',
        designation: 'Assistant Professor'
      });
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to add faculty');
    }
  });

  const filteredFaculty = facultyList.filter((f) => {
    const matchSearch =
      f.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newFaculty.displayName || !newFaculty.email || !newFaculty.employeeId || !newFaculty.department) {
      toast.error('Please fill in all mandatory fields');
      return;
    }
    createMutation.mutate(newFaculty);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users2 className="w-5 h-5 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Faculty Directory
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Institutional academic roster, course allocations, longitudinal rating histories, and AI reports.
          </p>
        </div>

        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Add Faculty
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search faculty by name, email, or employee ID..."
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
        </div>
      </div>

      {/* Directory Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : filteredFaculty.length === 0 ? (
        <EmptyState
          icon={Users2}
          title="No faculty members found"
          description={
            searchTerm || deptFilter
              ? 'No faculty matched the filter criteria.'
              : 'Add faculty profiles to enroll them into evaluation campaigns.'
          }
          action={
            <Button size="sm" onClick={() => setCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Add Faculty Profile
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFaculty.map((fac) => (
            <Card key={fac._id} className="hover:border-slate-300 transition-colors flex flex-col justify-between">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0">
                    {fac.displayName?.slice(0, 2)?.toUpperCase() || 'FA'}
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    <h3 className="font-semibold text-slate-900 text-sm truncate">
                      {fac.displayName}
                    </h3>
                    <div className="text-xs text-slate-500 truncate">{fac.designation}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      ID: {fac.employeeId}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 truncate">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{fac.department?.name || 'Department'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate text-slate-500">{fac.email}</span>
                  </div>
                </div>

                {fac.courses?.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {fac.courses.slice(0, 3).map((c) => (
                      <Badge key={c._id || c} variant="secondary" className="text-[10px]">
                        {c.code || c.name || 'Course'}
                      </Badge>
                    ))}
                    {fac.courses.length > 3 && (
                      <span className="text-[10px] text-slate-400 self-center">
                        +{fac.courses.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </CardContent>

              <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                <Link href={`/admin/reports?facultyId=${fac._id}`}>
                  <Button variant="ghost" size="sm" className="text-xs text-purple-700 hover:text-purple-800">
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    AI Report
                  </Button>
                </Link>

                <Link href={`/admin/faculty/${fac._id}`}>
                  <Button variant="outline" size="sm" className="text-xs text-blue-600">
                    View Profile
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Faculty Modal */}
      <Dialog open={createModalOpen} onClose={() => setCreateModalOpen(false)}>
        <DialogHeader>
          <DialogTitle>Add Faculty Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Full Name *"
            placeholder="e.g. Dr. Jane Doe"
            value={newFaculty.displayName}
            onChange={(e) => setNewFaculty({ ...newFaculty, displayName: e.target.value })}
            required
          />

          <Input
            type="email"
            label="Institutional Email *"
            placeholder="j.doe@institution.edu"
            value={newFaculty.email}
            onChange={(e) => setNewFaculty({ ...newFaculty, email: e.target.value })}
            required
          />

          <Input
            label="Employee Identifier *"
            placeholder="FAC-10024"
            value={newFaculty.employeeId}
            onChange={(e) => setNewFaculty({ ...newFaculty, employeeId: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Academic Department *
            </label>
            <select
              value={newFaculty.department}
              onChange={(e) => setNewFaculty({ ...newFaculty, department: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
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
            label="Designation / Academic Rank"
            placeholder="e.g. Associate Professor"
            value={newFaculty.designation}
            onChange={(e) => setNewFaculty({ ...newFaculty, designation: e.target.value })}
          />

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending}>
              Add Faculty Profile
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
