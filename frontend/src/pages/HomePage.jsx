import React from 'react';
import { ArrowRight, FileText, CheckCircle2, AlertTriangle, Layers, BookOpen, Sparkles, HelpCircle } from 'lucide-react';
import FlowPipeline from '../components/FlowPipeline';

export default function HomePage({ onStartAnalysis }) {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center pt-8 pb-4 max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Academic Research Prototype
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          AI Skill Gap Analyzer
        </h1>

        <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
          Analyze your resume against a job description and identify matched, partial, and missing skills with transparent, explainable reasoning.
        </p>

        {/* Simple User Flow Visual requested in prompt */}
        <div className="pt-4 pb-2">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
              <FileText className="w-4 h-4" /> Resume
            </span>
            <span className="text-slate-400 font-bold">→</span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
              <Layers className="w-4 h-4" /> Skill Analysis
            </span>
            <span className="text-slate-400 font-bold">→</span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-100">
              <AlertTriangle className="w-4 h-4" /> Skill Gap
            </span>
            <span className="text-slate-400 font-bold">→</span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
              <CheckCircle2 className="w-4 h-4" /> Learning Roadmap
            </span>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onStartAnalysis}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 active:scale-98 cursor-pointer"
          >
            <span>Start Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 7-Step Pipeline Visual */}
      <section>
        <FlowPipeline />
      </section>

      {/* Viva / Mentor Review Summary Card */}
      <section className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-400/30">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="space-y-3">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-blue-400 font-bold">
                Viva & Mentor Presentation Guide
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">
                How to Explain the Proposed Research Methodology
              </h3>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              When explaining this prototype to your viva panel or research mentor, use this concise 7-step rationale:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300 pt-1">
              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60">
                <span className="font-bold text-white">1. Input Ingestion:</span> The user uploads a resume PDF and enters target job requirements.
              </div>
              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60">
                <span className="font-bold text-white">2. Text Extraction:</span> PyMuPDF parses raw text page-by-page from the PDF without loss.
              </div>
              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60">
                <span className="font-bold text-white">3. Skill Normalization:</span> Lexical variants map to canonical representations (e.g., <code className="text-blue-300">React.js</code> &rarr; <code className="text-blue-300">React</code>) aligned with ESCO standards.
              </div>
              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60">
                <span className="font-bold text-white">4. Semantic Matching:</span> <code className="text-indigo-300">all-MiniLM-L6-v2</code> Sentence Transformer maps competencies into dense 384-dimensional vectors; cosine similarity measures contextual relatedness.
              </div>
              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60">
                <span className="font-bold text-white">5. Gap Classification:</span> Baseline research thresholds classify skills into Matched (&ge;0.70), Partial (0.50-0.69), and Missing (&lt;0.50).
              </div>
              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60">
                <span className="font-bold text-white">6. Explainable AI & Roadmap:</span> Evidence-backed rationale explains WHY each skill received its classification, followed by a deterministic learning curriculum.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

