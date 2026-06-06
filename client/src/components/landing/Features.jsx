import React from 'react';
import { motion } from 'framer-motion';
import { Key, ShieldCheck, EyeOff, AlertTriangle, FileCheck, Cpu } from 'lucide-react';
import { features } from '../../data/landing';

const VP = { once: true, amount: 0.15 };

const iconMap = {
  'hex-id': Key,
  'ai-shield': ShieldCheck,
  'zero-knowledge': EyeOff,
  malware: AlertTriangle,
  'file-transfer': FileCheck,
  quantum: Cpu,
};

function FeatureCard({ feature, index }) {
  const Icon = iconMap[feature.id];
  const isLarge = feature.size === 'large';

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 1.6, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative rounded-2xl p-6 overflow-hidden cursor-default transition-all duration-300 hover:-translate-y-2 ${
        isLarge ? 'md:col-span-2' : ''
      }`}
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        e.currentTarget.style.setProperty('--mx', `${x}%`);
        e.currentTarget.style.setProperty('--my', `${y}%`);
      }}
    >
      {/* Hover spotlight */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.08), transparent 55%)`,
        }}
      />
      {/* Hover border glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.2)` }}
      />

      {/* Icon */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 bg-white/5 border border-white/10"
      >
        {Icon && <Icon size={20} className="text-white" />}
      </div>

      <h3 className="text-lg font-bold mb-2 text-white">{feature.title}</h3>
      <p className="text-sm leading-relaxed text-gray-400">
        {feature.description}
      </p>

      {/* Bottom accent line on hover */}
      <div
        className="absolute bottom-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)` }}
      />
    </motion.div>
  );
}

export default function Features() {
  return (
    <section id="features" className="relative py-32">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%,rgba(255,255,255,0.03) 0%,transparent 60%)' }}
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
            Core Capabilities
          </p>
          <h2 className="text-4xl sm:text-5xl xl:text-6xl font-black text-white">
            Built for uncompromising privacy.
          </h2>
          <p className="text-lg max-w-xl mx-auto text-gray-400">
            Every layer of Nexus is engineered so that only you and your recipient can ever read what was sent.
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <FeatureCard key={f.id} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
