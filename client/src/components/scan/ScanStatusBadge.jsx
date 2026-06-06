import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Search, RefreshCw } from 'lucide-react';
import { SCAN_STATES } from '../../constants/scanStates';
import { getScanStatusConfig } from '../../utils/scanStatus';

export function ScanStatusBadge({ status }) {
  const [visible, setVisible] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const config = getScanStatusConfig(status);

  useEffect(() => {
    // Reset visibility when status changes
    setVisible(true);

    // If clean, fade out after 4 seconds
    if (status === SCAN_STATES.CLEAN) {
      const timer = setTimeout(() => {
        setVisible(false);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [status]);

  if (!visible && !expanded && status === SCAN_STATES.CLEAN) {
    // Render an ultra-microscopic safe indicator dot so the user can click to reveal it
    return (
      <div 
        className="flex items-center justify-center w-4 h-4 cursor-pointer transition-transform active:scale-90"
        onClick={() => setExpanded(true)}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-success/80 block" />
      </div>
    );
  }

  const getIcon = () => {
    switch (status) {
      case SCAN_STATES.CLEAN:
        return <ShieldCheck size={12} className="mr-1" />;
      case SCAN_STATES.SUSPICIOUS:
        return <ShieldAlert size={12} className="mr-1" />;
      case SCAN_STATES.SCANNING:
        return <Search size={12} className="mr-1 animate-spin" />;
      case SCAN_STATES.TIER2_SCANNING:
        return <RefreshCw size={12} className="mr-1 animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <div
      onClick={() => setExpanded(false)}
      className={`inline-flex items-center text-[10px] font-semibold py-0.5 px-2 rounded-full border transition-all duration-300 cursor-pointer ${config.bgClass}`}
    >
      {getIcon()}
      <span>{config.label}</span>
    </div>
  );
}

export default ScanStatusBadge;
