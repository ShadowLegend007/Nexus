import React from 'react';
import { Shield, Loader2 } from 'lucide-react';

export function DeepScanIndicator() {
  return (
    <div className="flex items-center space-x-2 bg-warning/10 border border-warning/30 rounded-lg p-2.5 max-w-xs">
      <Shield size={16} className="text-warning animate-pulse" />
      <div className="flex-1 space-y-1">
        <div className="text-[11px] font-semibold text-warning">🔬 Deep scan in progress...</div>
        <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-input)' }}>
          <div className="bg-warning h-full rounded-full animate-infinite-progress" style={{ width: '40%' }} />
        </div>
      </div>
      <Loader2 size={12} className="text-warning animate-spin" />
    </div>
  );
}

export default DeepScanIndicator;
