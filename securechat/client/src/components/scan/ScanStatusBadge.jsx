import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Search, RefreshCw } from 'lucide-react';
import { SCAN_STATES } from '../../constants/scanStates';
import { getScanStatusConfig } from '../../utils/scanStatus';

export function ScanStatusBadge({ status }) {
  const [visible, setVisible] = useState(true);
  const [hovered, setHovered] = useState(false);
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

  if (!visible && !hovered && status === SCAN_STATES.CLEAN) {
    // Render an ultra-microscopic safe indicator dot so the user can hover to reveal it
    return (
      <div 
        className="absolute bottom-1 right-2 flex items-center justify-end w-4 h-4 cursor-pointer"
        onMouseEnter={() => setHovered(true)}
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
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`inline-flex items-center text-[10px] font-semibold py-0.5 px-2 rounded-full border transition-all duration-300 ${config.bgClass}`}
    >
      {getIcon()}
      <span>{config.label}</span>
    </div>
  );
}

export default ScanStatusBadge;
