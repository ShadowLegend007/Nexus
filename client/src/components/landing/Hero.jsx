import React, { useRef, useEffect, Suspense, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import { slideInLeft, slideInRight } from '../../animations/variants';
import Antigravity from '../reactbits/Antigravity';
import SplitText from '../reactbits/SplitText';
import DecryptedText from '../reactbits/DecryptedText';

// Scan progress card
function ScanCard() {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('scanning');
  
  useEffect(() => {
    let raf, start = null;
    const animate = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 3200, 1);
      setProgress(p * 100);
      if (p < 1) { raf = requestAnimationFrame(animate); }
      else {
        setTimeout(() => setPhase('blocked'), 150);
        setTimeout(() => { setPhase('scanning'); setProgress(0); start = null; raf = requestAnimationFrame(animate); }, 3600);
      }
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className="rounded-2xl p-5 space-y-4 text-left"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold text-white text-[10px] font-mono">SC</div>
          <div>
            <p className="text-xs font-bold text-white">AI Shield System</p>
            <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping inline-block" />
              Inspection Online
            </span>
          </div>
        </div>
        <Cpu size={16} className="text-white animate-pulse" />
      </div>

      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Scanning Attachment</p>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white font-black text-[9px]">PDF</div>
          <div className="flex-1 space-y-1.5">
            <p className="text-[11px] font-semibold text-white truncate">security_manifest_2026.pdf</p>
            <div className="w-full h-1.5 rounded-full overflow-hidden bg-white/10">
              <div
                className="h-full rounded-full transition-all duration-100"
                style={{
                  width: `${progress.toFixed(1)}%`,
                  background: phase === 'blocked' ? '#ffffff' : 'rgba(255,255,255,0.5)',
                  boxShadow: phase === 'blocked' ? '0 0 8px #ffffff' : 'none',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div
        className="p-3 rounded-xl transition-all duration-500"
        style={{
          background: phase === 'blocked' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.02)',
          border: `1px solid ${phase === 'blocked' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)'}`,
        }}
      >
        <p className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${phase === 'blocked' ? 'text-white' : 'text-gray-400'}`}>
          <ShieldCheck size={11} />
          {phase === 'blocked' ? 'Threat Blocked & Quarantined' : 'Running Heuristic Analysis'}
        </p>
        {phase === 'blocked' && <p className="text-[10px] font-mono mt-1 text-gray-400">PDF_EXPLOIT — 98% confidence</p>}
        {phase === 'scanning' && <p className="text-[10px] font-mono mt-1 text-gray-500">Analyzing binary signatures...</p>}
      </div>
    </div>
  );
}

export default function Hero() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || window.matchMedia("(pointer: coarse)").matches);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden bg-black">
      {/* Desktop Background: Antigravity */}
      {!isMobile && (
        <div className="absolute inset-0 z-0 hidden md:block">
          <Antigravity
            count={300}
            magnetRadius={6}
            ringRadius={7}
            waveSpeed={0.4}
            waveAmplitude={1}
            particleSize={1.5}
            lerpSpeed={0.05}
            color={'#ffffff'}
            autoAnimate={true}
            particleVariance={1}
            rotationSpeed={0}
            depthFactor={1}
            pulseSpeed={3}
            particleShape="capsule"
            fieldStrength={10}
          />
        </div>
      )}
      
      {/* Mobile Background: Simpler animated gradient + grid */}
      <div className="absolute inset-0 z-0 md:hidden bg-black overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[60%] bg-gradient-to-b from-white/10 to-transparent" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      </div>
      
      {/* Dark overlay to make text readable */}
      <div className="absolute inset-0 z-[1] bg-black/60 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-16 items-center relative z-10">
        {/* LEFT: copy */}
        <motion.div
          className="space-y-8"
          variants={slideInLeft}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.15 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false }}
            transition={{ delay: 0.2, duration: 1.6 }}
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest bg-white/5 border border-white/20 text-white"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            Military Grade Protocol
          </motion.div>

          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.1] text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <SplitText
                text="The Future Of"
                className="block"
                delay={30}
                duration={0.8}
                splitType="chars"
                textAlign="left"
              />
              <span className="block mt-2">
                <DecryptedText
                  text="Secure Messaging."
                  speed={40}
                  className="text-white"
                />
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 max-w-lg leading-relaxed font-medium">
              Quantum-resistant encryption combined with real-time AI threat neutralization.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-bold bg-white text-black hover:bg-gray-200 transition-colors shadow-[0_4px_24px_rgba(255,255,255,0.15)]"
              >
                Create Account
                <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
              </motion.button>
            </Link>
            <Link to="/how-it-works">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-bold border border-white/20 text-white bg-white/5 hover:bg-white/10 transition-colors"
              >
                Read Whitepaper
              </motion.button>
            </Link>
          </div>

          {/* Removed Trusted Section */}
        </motion.div>

        {/* RIGHT: Visuals */}
        <motion.div
          className="relative h-[450px] lg:h-[500px] w-full max-w-[420px] mx-auto lg:ml-auto flex items-center justify-center"
          variants={slideInRight}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.15 }}
        >
          {/* Main glowing container */}
          <div className="absolute inset-0 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm transform rotate-3 scale-95" />
          <div className="absolute inset-0 bg-black border border-white/20 rounded-3xl shadow-[0_0_40px_rgba(255,255,255,0.05)] flex flex-col p-5">
            
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-white/10">
              <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex justify-start">
                <div className="bg-white/10 text-white px-4 py-2.5 rounded-2xl rounded-tl-sm text-sm border border-white/5 max-w-[80%]">
                  Can you send over the Q3 financial report?
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-white text-black px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm font-medium shadow-[0_4px_24px_rgba(255,255,255,0.1)] max-w-[80%]">
                  Attaching it now. The new AI shield should scan it instantly.
                </div>
              </div>
              <div className="flex justify-end">
                <div className="max-w-[80%] w-full">
                  <ScanCard />
                </div>
              </div>
            </div>
          </div>

          {/* Floating badge */}
          <motion.div
            className="absolute -right-6 -bottom-6 bg-white text-black p-4 rounded-2xl shadow-xl flex items-center gap-3"
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ShieldCheck size={24} className="text-black" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">Zero-Day Protected</p>
              <p className="text-[10px] font-mono">Verified • Just now</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
