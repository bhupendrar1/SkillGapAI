import React from 'react';
import { BookOpen, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white py-8 text-slate-500 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-slate-800">
            “An Explainable AI-Based System for Skill Gap Analysis”
          </p>
          <p className="mt-0.5 text-slate-500">
            Academic Research Prototype • Sentence Transformers & Cosine Similarity Semantic Pipeline
          </p>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            No Hallucinated Evidence
          </span>
          <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            ESCO-Aligned Normalization
          </span>
        </div>
      </div>
    </footer>
  );
}

