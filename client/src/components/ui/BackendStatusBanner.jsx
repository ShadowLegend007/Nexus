import React, { useState, useEffect, useCallback } from 'react';
import API from '../../api/api';
import { Loader2, CheckCircle2, AlertTriangle, RefreshCw, Zap, Server } from 'lucide-react';

export function BackendStatusBanner({ inline = false }) {
  const [status, setStatus] = useState('CONNECTING'); // 'CONNECTING', 'CONNECTED', 'FAILED'
  const [elapsed, setElapsed] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  const checkHealth = useCallback(async () => {
    setStatus('CONNECTING');
    setElapsed(0);

    const startTime = Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    try {
      // 55 second timeout to allow Render free tier web service cold boot
      await API.get('/api/health', { timeout: 55000 });
      clearInterval(interval);
      setStatus('CONNECTED');
      if (!inline) {
        setTimeout(() => {
          setDismissed(true);
        }, 4000);
      }
    } catch (err) {
      clearInterval(interval);
      console.warn('[Render Backend Health Check] Failed to reach Render server:', err.message);
      setStatus('FAILED');
    }
  }, [inline]);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  if (dismissed && !inline && status === 'CONNECTED') {
    return null;
  }

  // Render Inline card format for Login / Register pages
  if (inline) {
    return (
      <div className="w-full rounded-2xl overflow-hidden text-xs transition-all duration-300 border border-white/10 backdrop-blur-md">
        {status === 'CONNECTING' && (
          <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/15 to-amber-500/10 p-3.5 space-y-2 border-l-4 border-amber-400">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-200 font-semibold">
                <Loader2 size={16} className="animate-spin text-amber-400 shrink-0" />
                <span>Waking up Render Backend ({elapsed}s)</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold tracking-wider uppercase">
                <Zap size={10} /> Render Free Spin-Up
              </span>
            </div>
            <p className="text-[11px] text-amber-200/80 leading-relaxed pl-6">
              Render free Web Services sleep after 15 minutes of inactivity and take ~50 seconds to boot up. Please hang tight!
            </p>
            {/* Animated progress bar tuned for 50s Render boot */}
            <div className="w-full h-1 bg-amber-950/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full animate-pulse transition-all duration-1000"
                style={{ width: `${Math.min(100, Math.max(5, (elapsed / 50) * 100))}%` }}
              />
            </div>
          </div>
        )}

        {status === 'CONNECTED' && (
          <div className="bg-emerald-500/10 p-3 flex items-center justify-between border-l-4 border-emerald-400 text-emerald-200">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>Render Backend Online & Connected</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full uppercase">Ready</span>
          </div>
        )}

        {status === 'FAILED' && (
          <div className="bg-rose-500/10 p-3.5 space-y-2 border-l-4 border-rose-500 text-rose-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-rose-300">
                <AlertTriangle size={16} className="text-rose-400 shrink-0" />
                <span>Render Connection Timed Out</span>
              </div>
              <button
                type="button"
                onClick={checkHealth}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-semibold transition-colors text-[11px]"
              >
                <RefreshCw size={12} className="animate-spin-slow" /> Retry
              </button>
            </div>
            <p className="text-[11px] text-rose-300/80 pl-6">
              Unable to reach Render backend service. It may still be starting up. Click retry to ping again.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Render Top Floating Banner format for App Layout
  return (
    <div className="w-full z-50 transition-all duration-300">
      {status === 'CONNECTING' && (
        <div className="bg-gradient-to-r from-amber-950 via-yellow-950 to-amber-950 border-b border-amber-500/30 px-4 py-2 text-amber-200 text-xs flex items-center justify-between shadow-lg">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between w-full gap-2">
            <div className="flex items-center gap-2 font-medium">
              <Loader2 size={14} className="animate-spin text-amber-400 shrink-0" />
              <span>Waking up Render backend server ({elapsed}s)...</span>
              <span className="hidden md:inline text-amber-300/70">
                (Render free Web Services sleep on inactivity and take ~50s to boot)
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1">
                <Zap size={10} /> Render Free Spin-Up
              </span>
            </div>
          </div>
        </div>
      )}

      {status === 'CONNECTED' && (
        <div className="bg-emerald-950/90 border-b border-emerald-500/30 px-4 py-2 text-emerald-200 text-xs flex items-center justify-between backdrop-blur-md animate-fade-down">
          <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
              <span>Render Backend Connected & Online</span>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="text-[11px] text-emerald-300/70 hover:text-emerald-100 underline font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {status === 'FAILED' && (
        <div className="bg-rose-950/90 border-b border-rose-500/40 px-4 py-2 text-rose-200 text-xs flex items-center justify-between backdrop-blur-md animate-shake">
          <div className="max-w-7xl mx-auto flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle size={14} className="text-rose-400 shrink-0" />
              <span>Render backend service unreachable. Instance may still be spinning up.</span>
            </div>
            <button
              onClick={checkHealth}
              className="flex items-center gap-1 px-3 py-1 bg-rose-500/30 hover:bg-rose-500/50 rounded-lg text-white font-bold transition-all text-[11px]"
            >
              <RefreshCw size={12} /> Retry Connection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BackendStatusBanner;
