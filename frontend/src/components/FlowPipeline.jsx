import React from 'react';
import { FileText, Cpu, ArrowRight, ShieldCheck, HelpCircle, GraduationCap, Network, Layers } from 'lucide-react';

export default function FlowPipeline({ activeStep = null }) {
  const steps = [
    {
      id: 1,
      title: 'Resume & Job Input',
      desc: 'PDF resume upload & job requirements text input',
      icon: FileText,
      tech: 'PyMuPDF',
    },
    {
      id: 2,
      title: 'Skill Extraction',
      desc: 'Lexical boundary token & regex extraction with context',
      icon: Layers,
      tech: 'Regex & Boundary Parser',
    },
    {
      id: 3,
      title: 'Skill Normalization',
      desc: 'Mapping aliases to canonical representation (React.js -> React)',
      icon: Network,
      tech: 'ESCO Taxonomy Aliases',
    },
    {
      id: 4,
      title: 'Semantic Matching',
      desc: 'Dense embeddings & cosine similarity comparison',
      icon: Cpu,
      tech: 'all-MiniLM-L6-v2',
    },
    {
      id: 5,
      title: 'Gap Detection',
      desc: 'Classification into Matched (>=0.70), Partial (0.50-0.69), Missing (<0.50)',
      icon: ShieldCheck,
      tech: 'Threshold Logic',
    },
    {
      id: 6,
      title: 'Explainable AI',
      desc: 'Evidence-grounded rationale answering "Why this result?"',
      icon: HelpCircle,
      tech: 'Evidence Tracer',
    },
    {
      id: 7,
      title: 'Learning Roadmap',
      desc: 'Deterministic rule-based curriculum recommendations',
      icon: GraduationCap,
      tech: 'Curriculum Rules',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Research Methodology Pipeline</h3>
          <p className="text-xs text-slate-500">The 7 transparent steps implemented in this academic prototype</p>
        </div>
        <span className="text-[11px] font-mono uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200/60 font-semibold">
          End-to-End Flow
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-2.5 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;
          return (
            <div
              key={step.id}
              className={`flex flex-col p-3 rounded-xl border transition-all text-left relative ${
                isActive
                  ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-200 shadow-xs'
                  : 'bg-slate-50/60 border-slate-200/70 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-5 h-5 rounded-full bg-slate-200/80 text-slate-700 font-bold text-[10px] flex items-center justify-center font-mono">
                  {step.id}
                </span>
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
              </div>

              <h4 className="text-xs font-bold text-slate-800 leading-tight mb-1">{step.title}</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed mb-2 flex-grow">{step.desc}</p>

              <div className="mt-auto pt-1.5 border-t border-slate-200/50">
                <span className="text-[10px] font-medium font-mono text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200 block truncate">
                  {step.tech}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

