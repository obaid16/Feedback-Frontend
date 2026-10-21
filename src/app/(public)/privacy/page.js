import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar.js';
import { Footer } from '@/components/layout/Footer.js';
import { ShieldCheck, Lock, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Homepage
        </Link>

        <div className="bg-white p-8 sm:p-12 rounded-xl border border-slate-200 shadow-xs space-y-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              Institutional Privacy Disclosure
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Technical Anonymity & Data Minimization Policy
            </h1>
            <p className="text-xs text-slate-500 mt-2">Last updated: Academic Year 2026</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">1. Physical Collection Separation</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              In this institutional feedback portal, student anonymity is guaranteed at the database schema level. The backend maintains two physically isolated collections:
            </p>
            <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1.5 leading-relaxed">
              <li>
                <strong>CampaignRecipient</strong>: Records campaign eligibility and submission completion states so the system can send automated reminders and prevent multiple submissions. It contains zero feedback text, rating answers, or pointers to the submission row.
              </li>
              <li>
                <strong>FeedbackSubmission</strong>: Persists the answers and numeric ratings. For anonymous feedback campaigns, the <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">student</code> field is physically null in the database.
              </li>
            </ul>
          </section>

          <section id="anonymity-rules" className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">2. Small-Sample Suppression Threshold</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              To prevent deductive re-identification in small seminars or low-enrollment classes, the portal enforces an automated privacy threshold:
            </p>
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-semibold">Minimum Response Rule (5 Submissions Default):</p>
              <p>
                When a campaign yields fewer than 5 submissions, the API withholds qualitative excerpts and marks the evaluation report as <code className="font-mono">insufficient_data</code>. Definitive faculty evaluations are never synthesized from small samples.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">3. AI Synthesis & Prompt-Injection Safeguards</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              When qualitative reports are generated:
            </p>
            <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1.5 leading-relaxed">
              <li>Numeric statistics (averages, distributions, response rates) are calculated deterministically by server-side code, never by the AI.</li>
              <li>Student identity is never transmitted to OpenAI.</li>
              <li>All comments are length-bounded and scrubbed to prevent prompt-injection instruction overrides.</li>
            </ul>
          </section>

          <section id="retention" className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">4. Retention & Single-Submission Verification</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              When a student submits feedback, they receive a cryptographic receipt code (e.g., <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">FBP-XXXX-XXXX</code>). This token allows students to prove they completed their evaluation without disclosing their answers.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
