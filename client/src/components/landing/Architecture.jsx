import React from 'react';
import { motion } from 'framer-motion';
import { archSteps } from '../../data/landing';

const VP = { once: false, amount: 0.15 };

export default function Architecture() {
  return (
    <section id="how-it-works" className="relative py-32 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 100%,rgba(255,255,255,0.03) 0%,transparent 60%)' }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VP}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16 space-y-4"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
            Security Architecture
          </p>
          <h2 className="text-4xl sm:text-5xl xl:text-6xl font-black text-white">
            How your data flows.
          </h2>
          <p className="text-lg max-w-xl mx-auto text-gray-400">
            Every message travels through multiple security layers, each cryptographically independent.
          </p>
        </motion.div>

        <div className="max-w-lg mx-auto">
          {archSteps.map((step, i) => (
            <div key={step.label} className="relative">
              <motion.div
                initial={{ opacity: 0, x: i % 2 === 0 ? -80 : 80 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={VP}
                transition={{ duration: 1.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-5 rounded-2xl p-4 bg-[#0A0A0A] border border-white/10"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-mono text-xs font-black flex-shrink-0 bg-white/10 text-white border border-white/20"
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{step.label}</p>
                  <p className="text-[11px] text-gray-400">{step.sub}</p>
                </div>
              </motion.div>

              {/* Connector line */}
              {i < archSteps.length - 1 && (
                <motion.div
                  className="relative w-px mx-auto my-1 overflow-hidden"
                  style={{
                    height: '2.5rem',
                    background: `linear-gradient(to bottom, rgba(255,255,255,0.4), rgba(255,255,255,0.1))`,
                  }}
                  initial={{ scaleY: 0, originY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={VP}
                  transition={{ duration: 2.0, delay: i * 0.1 + 0.25, ease: [0.16, 1, 0.3, 1] }}
                >
                  {/* Animated packet dot */}
                  <motion.div
                    className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff]"
                    animate={{ y: [0, 36, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.4, ease: 'linear' }}
                  />
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
