import React from 'react';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

export default function SkillBadge({ status, name, score }) {
  if (status === 'Matched') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>{name}</span>
        {typeof score === 'number' && (
          <span className="text-[11px] font-mono text-emerald-600/80 pl-1 border-l border-emerald-200">
            {score.toFixed(2)}
          </span>
        )}
      </span>
    );
  }

  if (status === 'Partial') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>{name}</span>
        {typeof score === 'number' && (
          <span className="text-[11px] font-mono text-amber-600/80 pl-1 border-l border-amber-200">
            {score.toFixed(2)}
          </span>
        )}
      </span>
    );
  }

  // Missing
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
      <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
      <span>{name}</span>
      {typeof score === 'number' && (
        <span className="text-[11px] font-mono text-rose-600/80 pl-1 border-l border-rose-200">
          {score.toFixed(2)}
        </span>
      )}
    </span>
  );
}

