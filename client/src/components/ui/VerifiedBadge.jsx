import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function VerifiedBadge({ text = "Verified Safe", className = '' }) {
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/15 border border-success/30  shadow-[0_0_10px_rgba(16,185,129,0.2)] ${className}`}>
      <ShieldCheck size={12} className="text-success" />
      <span className="text-[10px] font-bold text-success uppercase tracking-wider">{text}</span>
    </div>
  );
}
