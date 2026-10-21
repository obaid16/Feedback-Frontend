import { apiClient } from './client.js';

export const authService = {
  getCsrfToken: () => apiClient('/auth/csrf-token'),
  login: (credentials) => apiClient('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (studentData) => apiClient('/auth/register', { method: 'POST', body: JSON.stringify(studentData) }),
  logout: () => apiClient('/auth/logout', { method: 'POST' }),
  getMe: () => apiClient('/auth/me'),
  forgotPassword: (email) => apiClient('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (payload) => apiClient('/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) })
};

export const studentService = {
  getMyCampaigns: async () => {
    const res = await apiClient('/submissions/my-campaigns');
    return res?.data?.campaigns || (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
  },
  getCampaignForm: async (campaignId) => {
    const res = await apiClient(`/submissions/campaigns/${campaignId}/form`);
    return res?.data || res;
  },
  saveDraft: async (campaignId, answers) => {
    const res = await apiClient(`/submissions/campaigns/${campaignId}/draft`, {
      method: 'POST',
      body: JSON.stringify({ answers })
    });
    return res?.data || res;
  },
  submitFeedback: async (campaignId, answers) => {
    const res = await apiClient(`/submissions/campaigns/${campaignId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers })
    });
    return res?.data || res;
  },
  getNotifications: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiClient(`/notifications${qs ? `?${qs}` : ''}`);
  },
  markNotificationRead: (id) => apiClient(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => apiClient('/notifications/read-all', { method: 'PATCH' })
};

export const adminService = {
  // Campaigns
  getCampaigns: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiClient(`/campaigns${qs ? `?${qs}` : ''}`);
  },
  getCampaign: (id) => apiClient(`/campaigns/${id}`),
  createCampaign: (data) => apiClient('/campaigns', { method: 'POST', body: JSON.stringify(data) }),
  publishCampaign: (id) => apiClient(`/campaigns/${id}/publish`, { method: 'POST' }),
  closeCampaign: (id) => apiClient(`/campaigns/${id}/close`, { method: 'POST' }),
  estimateAudience: (id) => apiClient(`/campaigns/${id}/audience-estimate`),

  // Feedback Forms
  getForms: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiClient(`/feedback-forms${qs ? `?${qs}` : ''}`);
  },
  getForm: (id) => apiClient(`/feedback-forms/${id}`),
  createForm: (data) => apiClient('/feedback-forms', { method: 'POST', body: JSON.stringify(data) }),
  updateForm: (id, data) => apiClient(`/feedback-forms/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  publishForm: (id) => apiClient(`/feedback-forms/${id}/publish`, { method: 'POST' }),
  createNewVersion: (id) => apiClient(`/feedback-forms/${id}/version`, { method: 'POST' }),
  reorderQuestions: (id, questionIds) =>
    apiClient(`/feedback-forms/${id}/reorder`, {
      method: 'POST',
      body: JSON.stringify({ questionIds })
    }),

  // Faculty
  getFacultyList: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiClient(`/faculty${qs ? `?${qs}` : ''}`);
  },
  getFaculty: (id) => apiClient(`/faculty/${id}`),
  createFaculty: (data) => apiClient('/faculty', { method: 'POST', body: JSON.stringify(data) }),
  updateFaculty: (id, data) => apiClient(`/faculty/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Students & Users
  getUsers: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiClient(`/users${qs ? `?${qs}` : ''}`);
  },
  getUser: (id) => apiClient(`/users/${id}`),
  updateUserStatus: (id, status) =>
    apiClient(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),
  provisionUser: (data) => apiClient('/users', { method: 'POST', body: JSON.stringify(data) }),

  // Departments
  getDepartments: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiClient(`/departments${qs ? `?${qs}` : ''}`);
  },
  createDepartment: (data) => apiClient('/departments', { method: 'POST', body: JSON.stringify(data) }),

  // Courses
  getCourses: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiClient(`/courses${qs ? `?${qs}` : ''}`);
  },
  createCourse: (data) => apiClient('/courses', { method: 'POST', body: JSON.stringify(data) }),

  // AI Integration
  generateFormAI: (payload) => apiClient('/ai/generate-form', { method: 'POST', body: JSON.stringify(payload) }),
  generateReportAI: (payload) => apiClient('/ai/reports/generate', { method: 'POST', body: JSON.stringify(payload) }),

  // Reports
  getReports: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiClient(`/reports${qs ? `?${qs}` : ''}`);
  },
  getReport: (id) => apiClient(`/reports/${id}`),
  downloadReportPdfBlob: (id) => apiClient(`/reports/${id}/pdf`, { responseType: 'blob' }),
  regenerateReport: (id) => apiClient(`/reports/${id}/regenerate`, { method: 'POST' }),

  // Analytics
  getAnalyticsOverview: () => apiClient('/analytics/overview'),
  getCampaignAnalytics: (campaignId) => apiClient(`/analytics/campaigns/${campaignId}`),
  getDepartmentAnalytics: () => apiClient('/analytics/departments'),
  getFacultyAnalytics: (facultyId) => apiClient(`/analytics/faculty/${facultyId}`),

  // Reminders
  getCampaignReminderStatus: (campaignId) => apiClient(`/reminders/campaigns/${campaignId}`),
  triggerReminderReconciliation: () => apiClient('/reminders/reconcile', { method: 'POST' }),
  retryRecipientReminder: (recipientId) => apiClient(`/reminders/recipients/${recipientId}/retry`, { method: 'POST' }),

  // Settings & Audit Logs
  getInstitutionalSettings: () => apiClient('/settings'),
  getAuditLogs: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiClient(`/settings/audit-logs${qs ? `?${qs}` : ''}`);
  }
};
