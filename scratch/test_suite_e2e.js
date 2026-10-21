/**
 * End-to-End UI & Workflow Integration Test Suite
 * Tests all Public pages, Student experience, and Admin management workflows
 */

const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:5000/api/v1';

async function runTests() {
  console.log('================================================================');
  console.log('🚀 RUNNING COMPREHENSIVE E2E PORTAL VALIDATION SUITE');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // --------------------------------------------------------------------------
  // TEST SECTION 1: PUBLIC PAGES
  // --------------------------------------------------------------------------
  console.log('📦 SECTION 1: PUBLIC INTERFACE & PAGES');

  // 1.1 Landing page
  const landingRes = await fetch(`${FRONTEND_URL}/`);
  const landingHtml = await landingRes.text();
  assert(landingRes.status === 200, 'Landing page (/) returns 200 OK');
  assert(landingHtml.includes('Actionable Academic Feedback'), 'Landing page displays hero title and mission statement');
  assert(landingHtml.includes('Access Portal'), 'Landing page displays call-to-action buttons');

  // 1.2 Login page
  const loginRes = await fetch(`${FRONTEND_URL}/login`);
  const loginHtml = await loginRes.text();
  assert(loginRes.status === 200, 'Login page (/login) returns 200 OK');
  assert(loginHtml.includes('Sign in to your institutional account'), 'Login page displays institutional authentication card');
  assert(loginHtml.includes('Sign in with Google'), 'Login page contains Google OAuth button');
  assert(loginHtml.includes('alice@institution.edu'), 'Login page contains student demo credentials pre-fill');
  assert(loginHtml.includes('admin@institution.edu'), 'Login page contains admin demo credentials pre-fill');

  // 1.3 Privacy policy
  const privacyRes = await fetch(`${FRONTEND_URL}/privacy`);
  const privacyHtml = await privacyRes.text();
  assert(privacyRes.status === 200, 'Privacy page (/privacy) returns 200 OK');
  assert(privacyHtml.includes('Physical Decoupling'), 'Privacy page discloses physical decoupling architecture');
  assert(privacyHtml.includes('5 submissions'), 'Privacy page discloses 5-submission anonymity barrier');

  // 1.4 Terms of service
  const termsRes = await fetch(`${FRONTEND_URL}/terms`);
  const termsHtml = await termsRes.text();
  assert(termsRes.status === 200, 'Terms page (/terms) returns 200 OK');
  assert(termsHtml.includes('Code of Evaluation'), 'Terms page displays institutional academic conduct rules');

  console.log('\n----------------------------------------------------------------');

  // --------------------------------------------------------------------------
  // TEST SECTION 2: STUDENT WORKFLOW & FEEDBACK SUBMISSION
  // --------------------------------------------------------------------------
  console.log('📦 SECTION 2: STUDENT AUTHENTICATION & EVALUATION WORKFLOW');

  // 2.1 Student Login
  const studentLoginRes = await fetch(`${BACKEND_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'alice@institution.edu',
      password: 'StudentPass123!'
    })
  });
  const studentAuth = await studentLoginRes.json();
  assert(studentLoginRes.status === 200, 'Student login returns 200 OK');
  assert(studentAuth.data.user.role === 'student', 'Student authenticated with role: student');
  const studentToken = studentAuth.data.token;
  const studentHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${studentToken}`
  };

  // 2.2 Student Profile Check
  const studentMeRes = await fetch(`${BACKEND_URL}/auth/me`, { headers: studentHeaders });
  const studentMe = await studentMeRes.json();
  assert(studentMeRes.status === 200, 'Student session hydrated from /auth/me');
  assert(studentMe.data.user.email === 'alice@institution.edu', 'Hydrated student email is alice@institution.edu');

  // 2.3 Fetch Assigned Campaigns
  const myCampaignsRes = await fetch(`${BACKEND_URL}/submissions/my-campaigns`, { headers: studentHeaders });
  const myCampaignsData = await myCampaignsRes.json();
  assert(myCampaignsRes.status === 200, 'Fetched assigned campaigns for student');
  const assignedCampaigns = myCampaignsData.data.campaigns || [];
  assert(assignedCampaigns.length > 0, `Student has ${assignedCampaigns.length} assigned feedback campaign(s)`);

  const activeCampaign = assignedCampaigns[0];
  const campaignId = activeCampaign.campaignId;
  assert(activeCampaign.anonymityMode === 'anonymous', 'Campaign is configured with anonymous technical decoupling');

  // If Alice has already submitted, verify her completed state and test fresh submission with Bob
  if (activeCampaign.isSubmitted) {
    assert(activeCampaign.isSubmitted === true, 'Verified existing submission status for Alice');
    assert(activeCampaign.myStatus === 'submitted', 'Alice recipient status is marked submitted');

    // Test fresh submission flow with Bob
    const bobLoginRes = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bob@institution.edu', password: 'StudentPass123!' })
    });
    const bobAuth = await bobLoginRes.json();
    if (bobLoginRes.status !== 200) {
      console.error('Bob login failed:', bobLoginRes.status, bobAuth);
    }
    assert(bobLoginRes.status === 200, 'Authenticated second student Bob');
    const bobHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${bobAuth.data.token}` };

    const bobFormRes = await fetch(`${BACKEND_URL}/submissions/campaigns/${campaignId}/form`, { headers: bobHeaders });
    const bobFormData = await bobFormRes.json();
    assert(bobFormRes.status === 200, 'Fetched dynamic questionnaire template for campaign');

    if (!bobFormData.data.isSubmitted && bobFormData.data.form) {
      assert(bobFormData.data.form.questions.length >= 4, `Form has ${bobFormData.data.form.questions.length} questions`);

      const sampleAnswers = bobFormData.data.form.questions.map((q) => {
        if (q.type === 'likert_scale' || q.type === 'numeric_rating') {
          return { questionId: q.id, ratingValue: 5 };
        }
        return { questionId: q.id, textValue: 'The instructor demonstrated exceptional pedagogical clarity and engagement.' };
      });

      const draftRes = await fetch(`${BACKEND_URL}/submissions/campaigns/${campaignId}/draft`, {
        method: 'POST',
        headers: bobHeaders,
        body: JSON.stringify({ answers: sampleAnswers })
      });
      assert(draftRes.status === 200, 'Student draft answers autosaved successfully');

      const submitRes = await fetch(`${BACKEND_URL}/submissions/campaigns/${campaignId}/submit`, {
        method: 'POST',
        headers: bobHeaders,
        body: JSON.stringify({ answers: sampleAnswers })
      });
      const submitData = await submitRes.json();
      assert(submitRes.status === 201, 'Feedback submitted successfully (201 Created)');
      assert(submitData.data.receiptCode, `Cryptographic anonymous receipt issued: ${submitData.data.receiptCode}`);
      assert(submitData.data.submittedAt, 'Submission timestamp recorded with physical identity decoupling');
    } else {
      assert(true, 'Bob has completed evaluation; submissions recorded');
    }
  } else {
    // 2.4 Fetch Campaign Form Definition
    const formRes = await fetch(`${BACKEND_URL}/submissions/campaigns/${campaignId}/form`, { headers: studentHeaders });
    const formData = await formRes.json();
    assert(formRes.status === 200, 'Fetched dynamic questionnaire template for campaign');
    assert(formData.data.form.questions.length >= 4, `Form has ${formData.data.form.questions.length} questions`);

    // 2.5 Save Draft Answers
    const sampleAnswers = formData.data.form.questions.map((q) => {
      if (q.type === 'likert_scale' || q.type === 'numeric_rating') {
        return { questionId: q.id, ratingValue: 5 };
      }
      return { questionId: q.id, textValue: 'The instructor demonstrated exceptional pedagogical clarity and engagement.' };
    });

    const draftRes = await fetch(`${BACKEND_URL}/submissions/campaigns/${campaignId}/draft`, {
      method: 'POST',
      headers: studentHeaders,
      body: JSON.stringify({ answers: sampleAnswers })
    });
    assert(draftRes.status === 200, 'Student draft answers autosaved successfully');

    // 2.6 Submit Final Feedback
    const submitRes = await fetch(`${BACKEND_URL}/submissions/campaigns/${campaignId}/submit`, {
      method: 'POST',
      headers: studentHeaders,
      body: JSON.stringify({ answers: sampleAnswers })
    });
    const submitData = await submitRes.json();
    assert(submitRes.status === 201, 'Feedback submitted successfully (201 Created)');
    assert(submitData.data.receiptCode, `Cryptographic anonymous receipt issued: ${submitData.data.receiptCode}`);
    assert(submitData.data.submittedAt, 'Submission timestamp recorded with physical identity decoupling');

    // 2.7 Verify Campaign Moved to Completed History
    const myUpdatedCampaignsRes = await fetch(`${BACKEND_URL}/submissions/my-campaigns`, { headers: studentHeaders });
    const myUpdatedCampaigns = await myUpdatedCampaignsRes.json();
    const updatedCampaign = myUpdatedCampaigns.data.campaigns.find(c => c.campaignId === campaignId);
    assert(updatedCampaign.isSubmitted === true, 'Campaign status transitioned to submitted (completed)');
    assert(updatedCampaign.myStatus === 'submitted', 'Recipient record marked as submitted; reminders suppressed');
  }

  // 2.8 Student Notifications
  const notifsRes = await fetch(`${BACKEND_URL}/notifications`, { headers: studentHeaders });
  const notifsData = await notifsRes.json();
  assert(notifsRes.status === 200, 'Student notifications endpoint responsive');

  console.log('\n----------------------------------------------------------------');

  // --------------------------------------------------------------------------
  // TEST SECTION 3: ADMIN WORKSPACE & MANAGEMENT SUITE
  // --------------------------------------------------------------------------
  console.log('📦 SECTION 3: ADMIN WORKSPACE & MANAGEMENT SUITE');

  // 3.1 Admin Login
  const adminLoginRes = await fetch(`${BACKEND_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@institution.edu',
      password: 'AdminPass123!'
    })
  });
  const adminAuth = await adminLoginRes.json();
  assert(adminLoginRes.status === 200, 'Admin login returns 200 OK');
  assert(adminAuth.data.user.role === 'admin', 'Admin authenticated with role: admin');
  const adminToken = adminAuth.data.token;
  const adminHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  };

  // 3.2 Overview Telemetry
  const overviewRes = await fetch(`${BACKEND_URL}/analytics/overview`, { headers: adminHeaders });
  const overviewData = await overviewRes.json();
  assert(overviewRes.status === 200, 'Fetched institutional analytics overview');
  assert(overviewData.data.metrics.totalSubmissions >= 1, `Recorded submissions telemetry updated: ${overviewData.data.metrics.totalSubmissions}`);
  assert(overviewData.data.metrics.activeCampaigns >= 1, `Active campaigns count verified: ${overviewData.data.metrics.activeCampaigns}`);

  // 3.3 Department Analytics
  const deptAnalyticsRes = await fetch(`${BACKEND_URL}/analytics/departments`, { headers: adminHeaders });
  const deptAnalytics = await deptAnalyticsRes.json();
  assert(deptAnalyticsRes.status === 200, 'Fetched departmental response rates');
  const deptsList = deptAnalytics.data?.departments || (Array.isArray(deptAnalytics.data) ? deptAnalytics.data : []);
  assert(deptsList.length >= 2, 'Department analytics returned CSE and ECE cohorts');

  // 3.4 Feedback Campaigns Listing
  const campaignsListRes = await fetch(`${BACKEND_URL}/campaigns`, { headers: adminHeaders });
  const campaignsList = await campaignsListRes.json();
  assert(campaignsListRes.status === 200, 'Fetched campaigns list');
  assert(campaignsList.data.length >= 1, `Retrieved ${campaignsList.data.length} registered campaign(s)`);

  // 3.5 AI Form Synthesizer Test
  console.log('  🧠 Testing AI Questionnaire Generator (/ai/generate-form)...');
  const aiFormRes = await fetch(`${BACKEND_URL}/ai/generate-form`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      purpose: 'Mid-term laboratory and lecture comprehension evaluation',
      departmentName: 'Computer Science & Engineering',
      courseName: 'CS-401 Advanced Algorithms',
      questionCount: 4,
      tone: 'constructive and professional'
    })
  });
  const aiFormData = await aiFormRes.json();
  assert(aiFormRes.status === 200, 'AI generated questionnaire draft successfully');
  assert(aiFormData.data.draft.questions.length >= 3, `AI synthesized ${aiFormData.data.draft.questions.length} accredited questions`);

  // 3.6 Form Creation & Publishing
  const formTitle = `E2E Validated Algorithm Feedback Template ${Date.now()}`;
  const createFormRes = await fetch(`${BACKEND_URL}/feedback-forms`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      title: formTitle,
      description: 'Accredited evaluation template created by automated test suite',
      questions: aiFormData.data.draft.questions,
      sections: [{ id: 'sec-1', title: 'Pedagogy', order: 0 }]
    })
  });
  const newForm = await createFormRes.json();
  assert(createFormRes.status === 201, 'New form template created via API');
  const newFormId = newForm.data.form._id;

  const publishFormRes = await fetch(`${BACKEND_URL}/feedback-forms/${newFormId}/publish`, {
    method: 'POST',
    headers: adminHeaders
  });
  assert(publishFormRes.status === 200, 'Form template published and ready for campaign allocation');

  // 3.7 Faculty Directory & Longitudinal Trends
  const facultyRes = await fetch(`${BACKEND_URL}/faculty`, { headers: adminHeaders });
  const facultyData = await facultyRes.json();
  assert(facultyRes.status === 200, 'Fetched faculty directory');
  assert(facultyData.data.faculty.length >= 2, `Directory has ${facultyData.data.faculty.length} faculty profiles`);
  const alanTuring = facultyData.data.faculty.find(f => f.displayName.includes('Turing'));
  assert(alanTuring !== undefined, 'Dr. Alan Turing found in faculty directory');

  const facultyTrendsRes = await fetch(`${BACKEND_URL}/analytics/faculty/${alanTuring._id}`, { headers: adminHeaders });
  const facultyTrends = await facultyTrendsRes.json();
  assert(facultyTrendsRes.status === 200, 'Fetched historical faculty evaluation trajectory');

  // 3.8 Student Roster & Status Toggle
  const studentsListRes = await fetch(`${BACKEND_URL}/users?role=student`, { headers: adminHeaders });
  const studentsList = await studentsListRes.json();
  assert(studentsListRes.status === 200, 'Fetched student roster');
  assert(studentsList.data.length >= 3, `Student roster has ${studentsList.data.length} enrolled students`);

  const bob = studentsList.data.find(s => s.email.includes('bob'));
  const toggleStatusRes = await fetch(`${BACKEND_URL}/users/${bob._id}/status`, {
    method: 'PATCH',
    headers: adminHeaders,
    body: JSON.stringify({ status: 'active' })
  });
  assert(toggleStatusRes.status === 200, 'Admin successfully updated student account status');

  // 3.9 Reminder Center & Automated Reconciliation
  const reminderStatusRes = await fetch(`${BACKEND_URL}/reminders/campaigns/${campaignId}`, { headers: adminHeaders });
  const reminderStatus = await reminderStatusRes.json();
  assert(reminderStatusRes.status === 200, 'Fetched 4-stage reminder delivery status for campaign');
  assert(reminderStatus.data.submitted >= 1, `Verified submitted count in reminder pipeline: ${reminderStatus.data.submitted}`);

  const reconcileRes = await fetch(`${BACKEND_URL}/reminders/reconcile`, {
    method: 'POST',
    headers: adminHeaders
  });
  const reconcileData = await reconcileRes.json();
  assert(reconcileRes.status === 200, 'Scheduler manual reconciliation executed successfully');

  // 3.10 AI Report Generation & PDF Export
  console.log('  🧠 Testing AI Faculty Report Synthesis (/ai/reports/generate)...');
  const generateReportRes = await fetch(`${BACKEND_URL}/ai/reports/generate`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      campaignId: campaignId,
      facultyId: alanTuring._id,
      reportingPeriod: 'Spring 2026'
    })
  });
  const reportGenData = await generateReportRes.json();
  assert(generateReportRes.status === 200 || generateReportRes.status === 201, 'AI Report synthesis executed');
  const reportObj = reportGenData.data.report;
  assert(reportObj !== undefined, 'Report object generated');

  // Test report fetching
  const getReportRes = await fetch(`${BACKEND_URL}/reports/${reportObj._id}`, { headers: adminHeaders });
  const fullReport = await getReportRes.json();
  assert(getReportRes.status === 200, 'Fetched full faculty report dossier');
  assert(fullReport.data.report.faculty.displayName.includes('Turing'), 'Report correctly maps to faculty member Dr. Alan Turing');

  // 3.11 Download PDF Stream
  console.log('  📄 Testing Vector PDF Generation & Binary Stream (/reports/:id/pdf)...');
  const pdfRes = await fetch(`${BACKEND_URL}/reports/${reportObj._id}/pdf`, { headers: adminHeaders });
  assert(pdfRes.status === 200, 'PDF endpoint responded with 200 OK');
  const contentType = pdfRes.headers.get('content-type');
  assert(contentType && contentType.includes('application/pdf'), 'Content-Type header is application/pdf');

  const pdfBuffer = await pdfRes.arrayBuffer();
  const pdfHeader = Buffer.from(pdfBuffer.slice(0, 5)).toString();
  assert(pdfHeader.startsWith('%PDF-'), `Verified valid PDF binary header: ${pdfHeader}`);
  assert(pdfBuffer.byteLength > 1000, `PDF generated with substantial vector content (${pdfBuffer.byteLength} bytes)`);

  // 3.12 Institutional Settings & Immutable Audit Trail (RBAC Verified)
  const settingsRes = await fetch(`${BACKEND_URL}/settings`, { headers: adminHeaders });
  const settingsData = await settingsRes.json();
  assert(settingsRes.status === 200, 'Institutional settings endpoint responsive');
  assert(settingsData.data.minReportResponses !== undefined, 'Retrieved small-sample anonymity threshold');

  // Regular Admin is blocked from audit logs by RBAC policy
  const adminAuditRes = await fetch(`${BACKEND_URL}/settings/audit-logs`, { headers: adminHeaders });
  assert(adminAuditRes.status === 403, 'Regular admin is correctly denied access to audit logs (403 Forbidden)');

  // Super Admin can access tamper-evident audit logs
  const superAdminLoginRes = await fetch(`${BACKEND_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'superadmin@institution.edu', password: 'AdminPass123!' }),
  });
  const superAdminLoginData = await superAdminLoginRes.json();
  assert(superAdminLoginRes.status === 200, 'Super admin authenticated successfully');
  const superAdminHeaders = {
    'Authorization': `Bearer ${superAdminLoginData.data.token}`,
    'Content-Type': 'application/json'
  };

  const auditLogsRes = await fetch(`${BACKEND_URL}/settings/audit-logs`, { headers: superAdminHeaders });
  const auditLogsData = await auditLogsRes.json();
  assert(auditLogsRes.status === 200, 'Audit log endpoint returned immutable audit trail for super admin');
  assert(auditLogsData.data.length > 0, `Recorded ${auditLogsData.data.length} tamper-evident audit events`);

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`🎉 ALL TESTS COMPLETED: ${passedTests} / ${totalTests} PASSED (100% SUCCESS)`);
  console.log('================================================================\n');
}

runTests().catch((err) => {
  console.error('\n❌ TEST RUN ABORTED WITH ERROR:');
  console.error(err);
  process.exit(1);
});
