'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services.js';
import { Button } from '@/components/ui/Button.js';
import { Badge } from '@/components/ui/Badge.js';
import { Input } from '@/components/ui/Input.js';
import { Card, CardContent } from '@/components/ui/Card.js';
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog.js';
import { Skeleton } from '@/components/ui/Skeleton.js';
import { EmptyState } from '@/components/ui/EmptyState.js';
import { Building2, Plus, Search, Calendar, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function AdminDepartmentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [newDept, setNewDept] = useState({
    name: '',
    code: '',
    description: ''
  });

  const queryClient = useQueryClient();

  const { data: deptsRes, isLoading } = useQuery({
    queryKey: ['departments-list'],
    queryFn: () => adminService.getDepartments()
  });

  const departments = deptsRes?.data || [];

  const createMutation = useMutation({
    mutationFn: (data) => adminService.createDepartment(data),
    onSuccess: () => {
      toast.success('Academic department registered');
      queryClient.invalidateQueries({ queryKey: ['departments-list'] });
      setCreateModalOpen(false);
      setNewDept({ name: '', code: '', description: '' });
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to create department');
    }
  });

  const filteredDepts = departments.filter((d) => {
    return (
      d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newDept.name || !newDept.code) {
      toast.error('Please provide department name and code');
      return;
    }
    createMutation.mutate(newDept);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Academic Departments
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Institutional faculties, course hierarchies, and organizational divisions.
          </p>
        </div>

        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Add Department
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search departments by title or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 text-xs"
        />
      </div>

      {/* Listing */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : filteredDepts.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No departments found"
          description="Register academic divisions to organize faculty courses and cohorts."
          action={
            <Button size="sm" onClick={() => setCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Add Department
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDepts.map((d) => (
            <Card key={d._id} className="hover:border-slate-300 transition-colors">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="font-semibold text-slate-900 text-sm block">
                      {d.name}
                    </span>
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      {d.code}
                    </Badge>
                  </div>
                  <Badge variant={d.isActive !== false ? 'success' : 'neutral'} className="text-[10px]">
                    Active
                  </Badge>
                </div>

                {d.description && (
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {d.description}
                  </p>
                )}

                <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Established {d.createdAt ? format(new Date(d.createdAt), 'MMM yyyy') : '2026'}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Department Modal */}
      <Dialog open={createModalOpen} onClose={() => setCreateModalOpen(false)}>
        <DialogHeader>
          <DialogTitle>Register Academic Department</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Department Name *"
            placeholder="e.g. Electrical & Electronics Engineering"
            value={newDept.name}
            onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
            required
          />

          <Input
            label="Department Code *"
            placeholder="e.g. EEE"
            value={newDept.code}
            onChange={(e) => setNewDept({ ...newDept, code: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Undergraduate and postgraduate academic curricula in electrical engineering."
              value={newDept.description}
              onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending}>
              Create Department
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
