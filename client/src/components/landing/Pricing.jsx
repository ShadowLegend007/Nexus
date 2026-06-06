import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { plans } from '../../data/landing';

const VP = { once: true, amount: 0.1 };

function PricingCard({ plan, index }) {
  const [mouse, setMouse] = useState({ x: 50, y: 50 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VP}
      transition={{ delay: index * 0.12, duration: 1.65, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative rounded-2xl p-px overflow-hidden cursor-default"
      style={{
        background: plan.highlighted
          ? 'linear-gradient(135deg,rgba(79,126,255,0.6),rgba(123,97,255,0.4),rgba(0,217,255,0.3))'
          : 'rgba(255,255,255,0.07)',
        boxShadow: plan.highlighted ? '0 24px 80px rgba(79,126,255,0.25)' : 'none',
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMouse({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
      }}
    >
      {plan.highlighted && (
        <div className="absolute -top-px left-1/2 -translate-x-1/2">
          <div className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-b-lg" style={{ background: 'linear-gradient(135deg,#4F7EFF,#7B61FF)', color: '#fff' }}>Most Popular</div>
        </div>
      )}

      <div
        className="rounded-[15px] p-7 h-full flex flex-col"
        style={{ background: plan.highlighted ? '#0A1028' : '#070B1F' }}
      >
        {/* Spotlight */}
        <div
          className="absolute inset-0 rounded-[15px] pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{ background: `radial-gradient(circle at ${mouse.x}% ${mouse.y}%, rgba(79,126,255,0.10), transparent 55%)` }}
        />

        <div className="mb-6 z-10 relative">
          <p className="text-sm font-bold mb-1" style={{ color: plan.highlighted ? '#4F7EFF' : 'rgba(255,255,255,0.6)' }}>{plan.name}</p>
          <div className="flex items-end gap-1 mb-3">
            {plan.price === null ? (
              <span className="text-3xl font-black text-white">Custom</span>
            ) : (
              <>
                <span className="text-3xl font-black text-white">${plan.price}</span>
                {plan.price > 0 && <span className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>/mo</span>}
              </>
            )}
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>{plan.description}</p>
        </div>

        <ul className="space-y-3 mb-8 flex-1 z-10 relative">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <Check size={14} className="mt-0.5 flex-shrink-0" style={{ color: plan.highlighted ? '#4F7EFF' : '#34d399' }} />
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>{f}</span>
            </li>
          ))}
        </ul>

        <Link to="/register" className="z-10 relative">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full text-sm font-bold py-3 rounded-xl transition-all duration-200"
            style={plan.highlighted ? {
              background: 'linear-gradient(135deg,#4F7EFF,#7B61FF)',
              color: '#fff',
              boxShadow: '0 8px 32px rgba(79,126,255,0.4)',
            } : {
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.8)',
              background: 'rgba(255,255,255,0.05)',
            }}
          >
            {plan.cta}
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}

export default function Pricing() {
  return (
    <section id="pricing" className="relative py-28">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%,rgba(123,97,255,0.07) 0%,transparent 60%)' }} />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VP}
          transition={{ duration: 2.0 }}
          className="text-center mb-16 space-y-4"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: '#7B61FF' }}>Pricing</p>
          <h2 className="text-3xl sm:text-4xl xl:text-5xl font-black text-white">Simple, transparent pricing</h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.45)' }}>Start free. Scale when you need it.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p, i) => <PricingCard key={p.name} plan={p} index={i} />)}
        </div>
      </div>
    </section>
  );
}
