'use client';

import React from 'react';
import Link from 'next/link';
import { GraduationCap, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-slate-900 tracking-tight">
                Faculty<span className="text-blue-600">Portal</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Institutional intelligence system for continuous instructional enhancement, rigorous technical anonymity, and automated academic feedback.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">Portal Navigation</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><Link href="/login" className="hover:text-blue-600">Student Sign In</Link></li>
              <li><Link href="/login" className="hover:text-blue-600">Administrator Portal</Link></li>
              <li><Link href="/#workflow" className="hover:text-blue-600">Evaluation Lifecycle</Link></li>
              <li><Link href="/#anonymity" className="hover:text-blue-600">Technical Anonymity</Link></li>
            </ul>
          </div>

          {/* Governance */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">Governance & Policies</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><Link href="/privacy" className="hover:text-blue-600">Data Minimization Policy</Link></li>
              <li><Link href="/privacy#anonymity-rules" className="hover:text-blue-600">De-Identification Guarantees</Link></li>
              <li><Link href="/terms" className="hover:text-blue-600">Terms of Institutional Use</Link></li>
              <li><Link href="/privacy#retention" className="hover:text-blue-600">Record Retention</Link></li>
            </ul>
          </div>

          {/* Privacy badge */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">Integrity Guarantee</h4>
            <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Physical Decoupling
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Student identities are stored in separate collections from feedback answers. AI models are strictly fed sanitized, de-identified comments.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>© 2026 Faculty Feedback & Intelligence Portal. All rights reserved.</p>
          <p>Academic Affairs & Institutional Research</p>
        </div>
      </div>
    </footer>
  );
}
