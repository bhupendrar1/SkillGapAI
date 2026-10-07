import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  HelpCircle,
  GraduationCap,
  ArrowLeft,
  FileText,
  RotateCcw,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
  Layers,
  Cpu
} from 'lucide-react';
import SkillBadge from '../components/SkillBadge';

export default function ResultsPage({ results, onNewAnalysis }) {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'matched', 'partial', 'missing'
  const [expandedRow, setExpandedRow] = useState(null);

  if (!results) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
        <p className="text-sm text-slate-500 mb-4">No analysis results found.</p>
        <button
          onClick={onNewAnalysis}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
        >
          Start New Analysis
        </button>
      </div>
    );
  }

  const {
    target_role = 'Software Developer',
    resume_source = 'Uploaded Resume',
    overall_match = 0,
    matched_skills = [],
    partial_skills = [],
    missing_skills = [],
    skill_analysis = [],
    recommendations = [],
    formula_explanation = '',
    stats = {
      total: skill_analysis.length,
      matched: matched_skills.length,
      partial: partial_skills.length,
      missing: missing_skills.length
    }
  } = results;

  // Filter table rows based on tab
  const filteredAnalysis = skill_analysis.filter((item) => {
    if (activeTab === 'matched') return item.status === 'Matched';
    if (activeTab === 'partial') return item.status === 'Partial';
    if (activeTab === 'missing') return item.status === 'Missing';
    return true;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Target Role: {target_role}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> {resume_source}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Skill Gap Analysis Results
          </h2>
        </div>

        <button
          onClick={onNewAnalysis}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs self-start cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Run Another Analysis</span>
        </button>
      </div>

      {/* 4 KPI METRIC CARDS */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Overall Match */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Overall Match</span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
              {overall_match}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Aggregated competency overlap
          </p>
        </div>

        {/* Card 2: Matched */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-200/80 bg-emerald-50/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-800 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Matched Skills</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-emerald-700 font-mono tracking-tight">
              {stats.matched}
            </span>
            <span className="text-xs text-emerald-600/80 font-medium">skills verified</span>
          </div>
          <p className="text-[11px] text-emerald-700/80 mt-2">
            Similarity &ge; 0.70 threshold
          </p>
        </div>

        {/* Card 3: Partial */}
        <div className="bg-white rounded-2xl p-5 border border-amber-200/80 bg-amber-50/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-800 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Partially Matched</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-amber-700 font-mono tracking-tight">
              {stats.partial}
            </span>
            <span className="text-xs text-amber-600/80 font-medium">related context</span>
          </div>
          <p className="text-[11px] text-amber-700/80 mt-2">
            0.50 &ndash; 0.69 similarity range
          </p>
        </div>

        {/* Card 4: Missing */}
        <div className="bg-white rounded-2xl p-5 border border-rose-200/80 bg-rose-50/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-800 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Missing Skills</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-rose-700 font-mono tracking-tight">
              {stats.missing}
            </span>
            <span className="text-xs text-rose-600/80 font-medium">gaps identified</span>
          </div>
          <p className="text-[11px] text-rose-700/80 mt-2">
            Similarity &lt; 0.50 threshold
          </p>
        </div>
      </section>

      {/* SECTION 1: OVERALL SKILL MATCH */}
      <section className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-[11px] font-mono uppercase tracking-wider text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Section 1 • Quantitative Metric
            </span>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              Overall Skill Match: {overall_match}%
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Based on semantic similarity between candidate profile evidence and job-required competencies.
            </p>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
              <span className="font-semibold text-slate-800 block">Dynamic Calculation Formula:</span>
              <code className="text-[11px] font-mono text-blue-800 bg-white px-2 py-1 rounded border border-slate-200 block truncate">
                {formula_explanation || `Overall Match = ((${stats.matched} * 1.0 + ${stats.partial} * 0.5) / ${stats.total}) * 100 = ${overall_match}%`}
              </code>
              <p className="text-slate-400 text-[10px]">
                Full contribution (1.0) for Matched skills, partial contribution (0.5) for Partially Matched skills, zero contribution (0.0) for Missing skills.
              </p>
            </div>
          </div>

          {/* Visual Circular/Horizontal Meter */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50/70 rounded-2xl border border-slate-200 shrink-0 w-full sm:w-64">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-slate-200"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-blue-600 transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - overall_match / 100)}`}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                  {overall_match}%
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Match Score</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 text-center mt-3 font-medium">
              {overall_match >= 70 ? 'Strong Candidate Alignment' : overall_match >= 50 ? 'Moderate Alignment (Upskill Suggested)' : 'Substantial Skill Gaps Detected'}
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: SKILL SUMMARY */}
      <section className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs">
        <div className="mb-5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            Section 2 • Categorical Overview
          </span>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
            Skill Summary
          </h3>
          <p className="text-xs text-slate-500">
            Categorized distribution of required competencies detected dynamically from the resume.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Matched Column */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4 flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-200/60">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  Matched Skills ({matched_skills.length})
                </h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded font-bold">
                &ge; 0.70
              </span>
            </div>

            {matched_skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {matched_skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-emerald-800 border border-emerald-300 shadow-2xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-2">No direct matched skills found.</p>
            )}
          </div>

          {/* Partially Matched Column */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-4 flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-amber-200/60">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Partially Matched ({partial_skills.length})
                </h4>
              </div>
              <span className="text-[10px] font-mono text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded font-bold">
                0.50 &ndash; 0.69
              </span>
            </div>

            {partial_skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {partial_skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-amber-800 border border-amber-300 shadow-2xs"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-2">No partially matched skills.</p>
            )}
          </div>

          {/* Missing Column */}
          <div className="rounded-xl border border-rose-200 bg-rose-50/30 p-4 flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-rose-200/60">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-600" />
                <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                  Missing Skills ({missing_skills.length})
                </h4>
              </div>
              <span className="text-[10px] font-mono text-rose-700 bg-rose-100/60 px-2 py-0.5 rounded font-bold">
                &lt; 0.50
              </span>
            </div>

            {missing_skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {missing_skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-rose-800 border border-rose-300 shadow-2xs"
                  >
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-2">No missing skills detected.</p>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 3: SKILL ANALYSIS TABLE */}
      <section className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Section 3 • Comparative Analysis
            </span>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
              Skill Analysis Table
            </h3>
            <p className="text-xs text-slate-500">
              Detailed comparison between job requirement and candidate resume evidence.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium self-start">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'all' ? 'bg-white text-blue-700 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({skill_analysis.length})
            </button>
            <button
              onClick={() => setActiveTab('matched')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'matched' ? 'bg-white text-emerald-700 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Matched ({stats.matched})
            </button>
            <button
              onClick={() => setActiveTab('partial')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'partial' ? 'bg-white text-amber-700 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Partial ({stats.partial})
            </button>
            <button
              onClick={() => setActiveTab('missing')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'missing' ? 'bg-white text-rose-700 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Missing ({stats.missing})
            </button>
          </div>
        </div>

        {/* The Clean Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Required Skill</th>
                <th className="py-3 px-4">Resume Evidence</th>
                <th className="py-3 px-4 font-mono text-center">Similarity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAnalysis.map((row, idx) => {
                const isExpanded = expandedRow === idx;
                return (
                  <React.Fragment key={row.skill}>
                    <tr
                      className={`hover:bg-slate-50/80 transition-colors ${
                        row.status === 'Matched'
                          ? 'bg-emerald-50/10'
                          : row.status === 'Partial'
                          ? 'bg-amber-50/10'
                          : 'bg-rose-50/10'
                      }`}
                    >
                      {/* Required Skill */}
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {row.skill}
                      </td>

                      {/* Resume Evidence */}
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {row.evidence === 'Not Found' ? (
                          <span className="text-slate-400 italic">Not Found</span>
                        ) : (
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-semibold border border-slate-200">
                            {row.evidence}
                          </span>
                        )}
                      </td>

                      {/* Cosine Similarity */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                        <span
                          className={`px-2 py-0.5 rounded ${
                            row.similarity >= 0.70
                              ? 'bg-emerald-100 text-emerald-800'
                              : row.similarity >= 0.50
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {typeof row.similarity === 'number' ? row.similarity.toFixed(2) : row.similarity}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <SkillBadge status={row.status} name={row.status} />
                      </td>

                      {/* Expand / Details Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setExpandedRow(isExpanded ? null : idx)}
                          className="text-slate-400 hover:text-blue-600 transition-colors p-1 cursor-pointer"
                          title="View evidence context"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Evidence Snippet Drawer */}
                    {isExpanded && (
                      <tr className="bg-slate-50/90 border-b border-slate-200">
                        <td colSpan={5} className="py-3 px-6 text-xs text-slate-600">
                          <div className="space-y-1">
                            <span className="font-bold text-slate-800">Verified Evidence & Context:</span>
                            {row.evidence_snippet ? (
                              <p className="font-mono text-[11px] text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
                                &ldquo;{row.evidence_snippet}&rdquo;
                              </p>
                            ) : (
                              <p className="text-slate-500 italic">
                                No contextual text snippet was found matching this competency in the parsed document.
                              </p>
                            )}
                            <p className="text-[11px] text-slate-500 pt-1">
                              <strong>Analytical Reason:</strong> {row.reason}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 4: WHY THIS RESULT? (EXPLAINABLE AI) */}
      <section className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs">
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Section 4 • Explainable AI (XAI)
            </span>
            <span className="text-[11px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200 font-semibold">
              Traceable Rationale
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
            Why this result?
          </h3>
          <p className="text-xs text-slate-500">
            Transparent, evidence-based reasoning answering why each skill was classified as Matched, Partial, or Missing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skill_analysis.map((item) => (
            <div
              key={item.skill}
              className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                item.status === 'Matched'
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : item.status === 'Partial'
                  ? 'border-amber-200 bg-amber-50/20'
                  : 'border-rose-200 bg-rose-50/20'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-900">{item.skill}</span>
                  <SkillBadge status={item.status} name={item.status} score={item.similarity} />
                </div>

                <div className="text-xs text-slate-700 mt-2 space-y-1.5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-slate-500 font-medium shrink-0">Detected Evidence:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {item.evidence === 'Not Found' ? 'None detected' : item.evidence}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 font-medium block mb-0.5">Explanation:</span>
                    <p className="text-slate-700 leading-relaxed bg-white/80 p-2.5 rounded-lg border border-slate-200/80 text-[11px]">
                      {item.reason}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 mt-3 border-t border-slate-200/50 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Cosine Sim: {typeof item.similarity === 'number' ? item.similarity.toFixed(2) : item.similarity}</span>
                <span>Ground-truth Evidence Trace</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: RECOMMENDED LEARNING */}
      <section className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs">
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Section 5 • Prescriptive Analytics
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
            Recommended Learning
          </h3>
          <p className="text-xs text-slate-500">
            Targeted rule-based curriculum addressing identified competency gaps (missing and partial skills).
          </p>
        </div>

        {recommendations && recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((rec, idx) => (
              <div
                key={rec.skill}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-900">
                      {idx + 1}. {rec.skill}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        rec.priority === 'High'
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}
                    >
                      Priority: {rec.priority}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 mb-3">{rec.reason}</p>

                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-slate-700 block">Core Topics to Master:</span>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {rec.topics.map((topic, tIdx) => (
                        <li key={tIdx} className="flex items-start gap-2 bg-white p-2 rounded-lg border border-slate-200/70">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                          <span className="text-[11px]">{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/80 text-[10px] text-slate-400 font-mono">
                  Deterministic Rule-Based Curriculum
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <p className="font-bold">Exceptional Match Profile!</p>
            <p className="text-emerald-700 mt-1">
              All required competencies for this job description were met with direct candidate evidence.
            </p>
          </div>
        )}
      </section>

      {/* SECTION 6: NO FAKE RESEARCH RESULTS (ACADEMIC PLACEHOLDER) */}
      <section className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-slate-600 text-xs">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-800 text-sm">
              Experimental Evaluation — To be conducted
            </h4>
            <p className="leading-relaxed text-slate-600 text-[11px]">
              In accordance with academic research integrity, scientific metrics such as benchmark precision, recall, F1-score, and inter-annotator agreement are not hard-coded or fabricated. Formal empirical validation across comprehensive ESCO benchmark datasets and qualitative viva evaluator studies will be conducted separately.
            </p>
            <div className="flex flex-wrap gap-2 pt-1 font-mono text-[10px] text-slate-500">
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200">SentenceTransformer: all-MiniLM-L6-v2</span>
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200">Thresholds: [Matched &ge; 0.70, Partial 0.50-0.69, Missing &lt; 0.50]</span>
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200">Parser: PyMuPDF</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

