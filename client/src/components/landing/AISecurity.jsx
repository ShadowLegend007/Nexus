import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Activity, ShieldCheck, AlertTriangle, BarChart2 } from 'lucide-react';
import { slideInLeft, slideInRight } from '../../animations/variants';

const VP = { once: true, amount: 0.15 };

const threats = [
  { name: 'PDF_EXPLOIT', confidence: 98, color: '#ffffff' },
  { name: 'TROJAN.GEN', confidence: 91, color: '#cccccc' },
  { name: 'RANSOMWARE.A', confidence: 87, color: '#999999' },
  { name: 'SPYWARE.X', confidence: 79, color: '#666666' },
];

function ThreatMeter({ threat, delay = 0 }) {
  const ref = useRef();
  const inView = useInView(ref, { once: false, margin: '-20px' });
  return (
    <div ref={ref} className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono font-bold text-gray-400">{threat.name}</span>
        <span className="text-[11px] font-bold text-white">{threat.confidence}%</span>
      </div>
      <div className="w-full h-1.5 rounded-full overflow-hidden bg-white/10">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={inView ? { width: `${threat.confidence}%` } : { width: 0 }}
          transition={{ duration: 2.0, delay, ease: [0.16, 1, 0.3, 1] }}
          style={{ background: threat.color, boxShadow: `0 0 8px ${threat.color}60` }}
        />
      </div>
    </div>
  );
}

function LiveCounter({ label, value, color }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef();
  const inView = useInView(ref, { once: false, margin: '-20px' });
  
  useEffect(() => {
    if (!inView) {
      setDisplay(0);
      return;
    }
    let start = null;
    let raf;
    const animate = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 1500, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.floor(eased * value));
      if (p < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);
  
  return (
    <div ref={ref} className="text-center">
      <p className="text-2xl font-black text-white">{display.toLocaleString()}</p>
      <p className="text-[11px] text-gray-400">{label}</p>
    </div>
  );
}

export default function AISecurity() {
  return (
    <section id="security" className="relative py-32 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 80% 50%,rgba(255,255,255,0.03) 0%,transparent 60%)' }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VP}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16 space-y-4"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">AI Threat Intelligence</p>
          <h2 className="text-4xl sm:text-5xl xl:text-6xl font-black text-white">
            Live Security Dashboard
          </h2>
          <p className="text-lg max-w-xl mx-auto text-gray-400">
            Every attachment passes through a sandboxed dual-tier ML pipeline. Results are instant.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left: threat meters */}
          <motion.div
            variants={slideInLeft}
            initial="hidden"
            whileInView="show"
            viewport={VP}
            className="rounded-2xl p-6 space-y-6 bg-[#0A0A0A] border border-white/10 shadow-[0_24px_60px_rgba(255,255,255,0.02)]"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-white animate-pulse" />
                <span className="text-sm font-bold text-white">Threat Detection Engine</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white/10 text-white border border-white/20">LIVE</span>
            </div>

            <div className="space-y-4">
              {threats.map((t, i) => <ThreatMeter key={t.name} threat={t} delay={i * 0.15} />)}
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-white/10">
              <LiveCounter label="Scans Today" value={14823} />
              <LiveCounter label="Blocked" value={239} />
              <LiveCounter label="Clean" value={14584} />
            </div>
          </motion.div>

          {/* Right: risk heatmap + metrics */}
          <motion.div
            variants={slideInRight}
            initial="hidden"
            whileInView="show"
            viewport={VP}
            className="space-y-5"
          >
            {/* Confidence scores */}
            <div className="rounded-2xl p-5 space-y-4 bg-[#0A0A0A] border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <BarChart2 size={15} className="text-white" />
                <span className="text-sm font-bold text-white">AI Confidence Matrix</span>
              </div>
              {[
                { label: 'Signature Match', pct: 99, color: '#ffffff' },
                { label: 'Behavioural Analysis', pct: 94, color: '#cccccc' },
                { label: 'Sandbox Heuristics', pct: 87, color: '#999999' },
                { label: 'Network Reputation', pct: 76, color: '#666666' },
              ].map((m, i) => (
                <div key={m.label} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">{m.label}</span>
                    <span className="text-[11px] font-bold text-white">{m.pct}%</span>
                  </div>
                  <div className="w-full h-1 rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${m.pct}%` }}
                      viewport={VP}
                      transition={{ duration: 2.0, delay: 0.3 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      style={{ background: m.color, boxShadow: `0 0 6px ${m.color}80` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Alert feed */}
            <div className="rounded-2xl p-5 space-y-3 bg-[#0A0A0A] border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck size={15} className="text-white" />
                <span className="text-sm font-bold text-white">Recent Detections</span>
              </div>
              {[
                { file: 'invoice_q2.pdf', type: 'PDF_MACRO', status: 'blocked', time: '2s ago' },
                { file: 'update.exe', type: 'RANSOMWARE', status: 'blocked', time: '14s ago' },
                { file: 'report.docx', type: 'Clean', status: 'clean', time: '31s ago' },
              ].map((item) => (
                <div
                  key={item.file}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border ${item.status === 'blocked' ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10'}`}
                >
                  <AlertTriangle size={12} className={item.status === 'blocked' ? 'text-white' : 'text-gray-400'} style={{ flexShrink: 0 }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-white truncate">{item.file}</p>
                    <p className="text-[9px] font-mono text-gray-500">{item.type}</p>
                  </div>
                  <span className="text-[9px] text-gray-500">{item.time}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
