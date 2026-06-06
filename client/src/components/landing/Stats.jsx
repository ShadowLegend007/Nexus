import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { stats } from '../../data/landing';

const VP = { once: false, amount: 0.15 };

function CountUp({ target, suffix, decimals = 0, duration = 2000 }) {
  const [value, setValue] = useState(0);
  const ref = useRef();
  const inView = useInView(ref, { once: false, margin: '-50px' });
  
  useEffect(() => {
    if (!inView) {
      setValue(0);
      return;
    }
    let start = null;
    let raf;
    const animate = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(+(eased * target).toFixed(decimals));
      if (p < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration, decimals]);
  
  return <span ref={ref}>{decimals > 0 ? value.toFixed(decimals) : value.toLocaleString()}{suffix}</span>;
}

export default function Stats() {
  return (
    <section className="relative py-32">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 50%,rgba(255,255,255,0.03) 0%,transparent 65%)' }} />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VP}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14 space-y-3"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">By The Numbers</p>
          <h2 className="text-4xl sm:text-5xl xl:text-6xl font-black text-white">Trusted at scale.</h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={VP}
              transition={{ duration: 1.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative group rounded-2xl p-6 text-center cursor-default bg-[#0A0A0A] border border-white/10"
            >
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.2)', background: 'radial-gradient(circle at 50% 0%,rgba(255,255,255,0.05),transparent 70%)' }}
              />
              <p
                className="text-xl sm:text-3xl lg:text-4xl font-black mb-1 text-white relative break-words"
              >
                <CountUp target={s.value} suffix={s.suffix} decimals={s.decimals || 0} />
              </p>
              <p className="text-sm text-gray-400">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
