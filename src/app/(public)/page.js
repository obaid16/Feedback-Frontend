'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar.js';
import { Footer } from '@/components/layout/Footer.js';
import { Button } from '@/components/ui/Button.js';
import { Badge } from '@/components/ui/Badge.js';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card.js';
import {
  GraduationCap,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Clock,
  BarChart3,
  MailCheck,
  FileCheck2,
  ChevronRight,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-gradient-to-b from-white to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Mission & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Verified Technical Anonymity Guarantee</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Elevating Higher Education Through <span className="text-blue-600">Actionable Academic Feedback</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                An institutional evaluation portal providing authenticated course feedback, automated multi-stage reminder workflows, cryptographic student de-identification, and deterministic AI report synthesis.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link href="/login" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full gap-2 shadow-md">
                    Access Portal
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/privacy" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full gap-2">
                    <Lock className="w-4 h-4 text-slate-500" />
                    Read Anonymity Blueprint
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 text-left max-w-lg mx-auto lg:mx-0">
                <div>
                  <div className="text-lg font-bold text-slate-900">100%</div>
                  <div className="text-xs text-slate-500">Identity Decoupling</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900">4-Stage</div>
                  <div className="text-xs text-slate-500">Automated Follow-ups</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900">Deterministic</div>
                  <div className="text-xs text-slate-500">Statistical Engine</div>
                </div>
              </div>
            </div>

            {/* Right Column: Realistic Live Product Preview Card */}
            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="relative"
              >
                <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
                  {/* Mock Window Bar */}
                  <div className="bg-slate-900 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-xs text-slate-400 font-mono ml-2">Faculty Intelligence Report • Preview</span>
                    </div>
                    <Badge variant="success" className="text-[10px]">Confidential</Badge>
                  </div>

                  <div className="p-6 space-y-5">
                    {/* Header info */}
                    <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-blue-600">Computer Science & Engineering</div>
                        <h3 className="text-base font-bold text-slate-900 mt-0.5">Dr. Alan Turing</h3>
                        <p className="text-xs text-slate-500 font-mono">CS301 • Operating Systems & Concurrency</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-extrabold text-blue-600">4.82<span className="text-xs text-slate-400 font-normal"> / 5.0</span></div>
                        <div className="text-[11px] text-emerald-600 font-medium">92% Response Rate</div>
                      </div>
                    </div>

                    {/* Metric Cards */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="text-[10px] font-semibold text-slate-400 uppercase">Submissions</div>
                        <div className="text-base font-bold text-slate-800">48 / 52</div>
                        <div className="text-[10px] text-slate-500">Separated Tracking</div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="text-[10px] font-semibold text-slate-400 uppercase">Teaching Clarity</div>
                        <div className="text-base font-bold text-blue-600">4.9 / 5.0</div>
                        <div className="text-[10px] text-emerald-600">Top 5% Departmental</div>
                      </div>
                    </div>

                    {/* AI Qualitative Synthesis Excerpt */}
                    <div className="p-3.5 rounded-lg bg-blue-50/50 border border-blue-100 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        AI Thematic Synthesis
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed italic">
                        &quot;Students unanimously commended the clarity of concurrent semaphore explanations and real-world kernel memory tracing exercises.&quot;
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium pt-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Aggregated across 48 de-identified submissions</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Stage Workflow Section */}
      <section id="workflow" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">End-to-End Governance</h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              The 4-Stage Evaluation Lifecycle
            </h3>
            <p className="text-sm text-slate-600 mt-3">
              Built to maximize completion rates with respectful, automated reminders while protecting technical anonymity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-lg bg-slate-50 border border-slate-200 relative">
              <div className="w-9 h-9 rounded-md bg-blue-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                1
              </div>
              <h4 className="text-sm font-bold text-slate-900">Audience Publishing</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Admins publish campaigns targeted by cohort, department, or course. Eligible recipient tracking records are generated idempotently.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-lg bg-slate-50 border border-slate-200 relative">
              <div className="w-9 h-9 rounded-md bg-blue-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                2
              </div>
              <h4 className="text-sm font-bold text-slate-900">Autonomous Reminders</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Background queues check submission status. Students receive Invitation, Reminder 1, and Reminder 2. When they submit, pending reminders cancel immediately.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-lg bg-slate-50 border border-slate-200 relative">
              <div className="w-9 h-9 rounded-md bg-blue-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                3
              </div>
              <h4 className="text-sm font-bold text-slate-900">Physical Anonymity</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Student identities are never persisted in the submission payload. Students receive a cryptographically verified receipt code for confirmation.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-lg bg-slate-50 border border-slate-200 relative">
              <div className="w-9 h-9 rounded-md bg-blue-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                4
              </div>
              <h4 className="text-sm font-bold text-slate-900">AI Report Synthesis</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Deterministic calculations yield accurate averages and distributions. OpenAI synthesizes pedagogical strengths and actionable teaching recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Anonymity Deep Dive */}
      <section id="anonymity" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 shadow-sm">
            <div className="flex items-center gap-2.5 text-emerald-800 font-semibold text-xs tracking-wider uppercase mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Architectural Technical Guarantee
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              Why Our Anonymity Isn&apos;t Just a UI Label
            </h3>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              Unlike generic feedback forms that simply hide the student name in the user interface while storing foreign keys in the database, our portal enforces physical collection separation:
            </p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Eligibility Tracking (`CampaignRecipient`)
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Maintains the student ID to send reminders and prevent duplicate submissions. Contains zero response answers or pointers to the feedback collection.
                </p>
              </div>

              <div className="p-5 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Feedback Content (`FeedbackSubmission`)
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Stores responses and ratings. In anonymous campaigns, the `student` field is strictly null. No user IDs, names, or emails are ever recorded.
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>Small-Sample Privacy Threshold:</strong> If fewer than 5 students submit feedback in a cohort, qualitative excerpts and definitive evaluations are withheld by the API to prevent deductive re-identification.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Ready to Begin Your Evaluation?
          </h2>
          <p className="text-sm text-slate-600 mt-2 max-w-xl mx-auto">
            Log in with your verified institutional Google credentials or university email to view your assigned campaigns.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="gap-2">
                Sign In to Portal
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
