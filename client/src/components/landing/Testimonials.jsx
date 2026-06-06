import React, { useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { testimonials } from '../../data/landing';

function TestimonialCard({ t }) {
  return (
    <div
      className="flex-shrink-0 w-80 rounded-2xl p-6 space-y-4 mx-3"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
        &ldquo;{t.text}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black"
          style={{ background: 'linear-gradient(135deg,#4F7EFF,#7B61FF)', color: '#fff' }}
        >
          {t.name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-bold text-white">{t.name}</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>{t.role}</p>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const sectionRef = useRef();
  const inView = useInView(sectionRef, { once: true, margin: '-80px' });
  const trackRef = useRef();

  // Infinite marquee via CSS animation
  const doubled = [...testimonials, ...testimonials];

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 20% 50%,rgba(123,97,255,0.06) 0%,transparent 60%)' }} />

      <div className="max-w-7xl mx-auto px-6 mb-14">
        <motion.div
          ref={sectionRef}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 2.0 }}
          className="text-center space-y-4"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: '#7B61FF' }}>What People Say</p>
          <h2 className="text-3xl sm:text-4xl xl:text-5xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Trusted by security professionals</h2>
        </motion.div>
      </div>

      {/* Marquee */}
      <div className="relative">
        {/* fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none" style={{ background: 'linear-gradient(90deg,#050816,transparent)' }} />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none" style={{ background: 'linear-gradient(-90deg,#050816,transparent)' }} />

        <div
          ref={trackRef}
          className="flex"
          style={{ animation: 'marquee 40s linear infinite' }}
          onMouseEnter={() => { if (trackRef.current) trackRef.current.style.animationPlayState = 'paused'; }}
          onMouseLeave={() => { if (trackRef.current) trackRef.current.style.animationPlayState = 'running'; }}
        >
          {doubled.map((t, i) => <TestimonialCard key={i} t={t} />)}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
