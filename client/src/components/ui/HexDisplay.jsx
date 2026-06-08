import React, { useEffect, useState } from 'react';

export function HexDisplay({ hexCode, className = '', animate = true }) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    if (!animate || !hexCode) {
      setDisplayed(hexCode || '');
      return;
    }
    
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      if (i >= hexCode.length) {
        clearInterval(interval);
        return;
      }
      const char = hexCode[i];
      if (char !== undefined) {
        setDisplayed((prev) => prev + char);
      }
      i++;
      if (i >= hexCode.length) clearInterval(interval);
    }, 60);

    return () => clearInterval(interval);
  }, [hexCode, animate]);

  return (
    <div
      className={`font-mono font-bold tracking-widest w-full text-center break-all pb-1 select-all ${className}`}
      style={{
        color: 'var(--accent, #7c3aed)',
      }}
    >
      {displayed}
      {animate && displayed.length < (hexCode?.length || 0) && (
        <span className="inline-block w-2 h-4 animate-pulse ml-1 align-middle" style={{ background: 'var(--accent)' }} />
      )}
    </div>
  );
}
