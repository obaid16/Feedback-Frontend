import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar.js';
import { Footer } from '@/components/layout/Footer.js';
import { ArrowLeft, BookOpenCheck } from 'lucide-react';

export default function TermsPage() {
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
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium mb-3">
              <BookOpenCheck className="w-3.5 h-3.5" />
              Institutional Terms of Service
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Student & Faculty Code of Evaluation
            </h1>
            <p className="text-xs text-slate-500 mt-2">Academic Terms & Conditions</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">1. Constructive Pedagogical Purpose</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Course evaluations exist solely to improve instruction quality, assess curricular pacing, and provide academic leadership with data to support faculty growth. Feedback must focus on teaching methodologies, classroom clarity, syllabus adherence, and mentorship availability.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">2. Prohibited Conduct</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Submissions containing defamatory, discriminatory, abusive, or profane content, or remarks targeting protected personal characteristics, are strictly prohibited under the institutional code of student conduct.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">3. Finality of Submission</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Once an evaluation is finalized and submitted, answers cannot be edited or retracted, preserving the integrity of aggregate data. In-progress drafts may be saved and resumed prior to the published deadline.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
