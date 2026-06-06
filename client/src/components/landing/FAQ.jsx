import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { faqs } from '../../data/landing';

const VP = { once: false, amount: 0.15 };

function FAQItem({ faq, index }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VP}
      transition={{ duration: 2.0, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-2xl overflow-hidden border transition-colors duration-300 ${open ? 'border-white/30' : 'border-white/10'}`}
    >
      <button
        className={`w-full flex items-center justify-between gap-4 p-5 text-left transition-colors duration-300 ${open ? 'bg-white/10' : 'bg-[#0A0A0A]'}`}
        onClick={() => setOpen(!open)}
      >
        <span className={`text-sm font-semibold ${open ? 'text-white' : 'text-gray-300'}`}>{faq.q}</span>
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${open ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-400'}`}
        >
          <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.6 }}>
            <Plus size={14} />
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden bg-[#0A0A0A]"
          >
            <p className="px-5 pb-5 pt-2 text-sm leading-relaxed text-gray-400">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  return (
    <section className="relative py-32">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 50%,rgba(255,255,255,0.03) 0%,transparent 60%)' }} />
      <div className="max-w-3xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VP}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14 space-y-4"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">FAQ</p>
          <h2 className="text-4xl sm:text-5xl xl:text-6xl font-black text-white">Common questions.</h2>
        </motion.div>
        <div className="space-y-3">
          {faqs.map((f, i) => <FAQItem key={f.q} faq={f} index={i} />)}
        </div>
      </div>
    </section>
  );
}
