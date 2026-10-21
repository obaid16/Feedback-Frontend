'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '@/lib/api/services.js';
import { Button } from '@/components/ui/Button.js';
import { Badge } from '@/components/ui/Badge.js';
import { Card, CardContent } from '@/components/ui/Card.js';
import { Skeleton } from '@/components/ui/Skeleton.js';
import { EmptyState } from '@/components/ui/EmptyState.js';
import {
  Bell,
  CheckCheck,
  Check,
  Clock,
  AlertTriangle,
  Info,
  Calendar,
  Sparkles
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';

export default function StudentNotificationsPage() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const queryClient = useQueryClient();

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['notifications', { unreadOnly }],
    queryFn: () => studentService.getNotifications({ unreadOnly })
  });

  const notifications = response?.data || [];
  const pagination = response?.meta || {};

  const markReadMutation = useMutation({
    mutationFn: (id) => studentService.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: () => {
      toast.error('Failed to update notification state');
    }
  });

  const markAllMutation = useMutation({
    mutationFn: () => studentService.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
    onError: () => {
      toast.error('Failed to mark all notifications as read');
    }
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'reminder':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'system':
        return <Sparkles className="w-4 h-4 text-indigo-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-5 h-5 text-indigo-600" />
            <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
            {unreadCount > 0 && (
              <Badge variant="primary" className="text-xs">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Institutional announcements, feedback deadlines, and submission reminders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={unreadOnly ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setUnreadOnly(!unreadOnly)}
          >
            {unreadOnly ? 'Showing Unread' : 'Filter Unread'}
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              loading={markAllMutation.isPending}
              onClick={() => markAllMutation.mutate()}
            >
              <CheckCheck className="w-4 h-4 mr-1.5" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          Failed to load notifications. Please try refreshing.
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={unreadOnly ? 'No unread notifications' : 'No notifications yet'}
          description={
            unreadOnly
              ? 'You have caught up with all reminders and messages.'
              : 'You will receive notifications here regarding upcoming feedback deadlines and academic announcements.'
          }
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <Card
              key={notif._id}
              className={`transition-colors ${
                notif.isRead
                  ? 'bg-white opacity-85 hover:opacity-100'
                  : 'bg-indigo-50/20 border-indigo-200 shadow-xs'
              }`}
            >
              <CardContent className="p-4 sm:p-5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-2 rounded-lg bg-slate-100 shrink-0 mt-0.5">
                    {getTypeIcon(notif.type)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">
                        {notif.title}
                      </span>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                      <Calendar className="w-3 h-3" />
                      {notif.createdAt
                        ? `${formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })} (${format(
                            new Date(notif.createdAt),
                            'MMM d, yyyy h:mm a'
                          )})`
                        : 'Recently'}
                    </div>
                  </div>
                </div>

                {!notif.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-slate-500 hover:text-indigo-600"
                    loading={markReadMutation.isPending}
                    onClick={() => markReadMutation.mutate(notif._id)}
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
