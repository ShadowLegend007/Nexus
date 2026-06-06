import React from 'react';
import { motion } from 'framer-motion';
import ProfileCard from '../reactbits/ProfileCard';

const developers = [
  {
    name: "Alex Sterling",
    title: "Lead Cryptography Engineer",
    handle: "alexstr",
    status: "Working on Quantum Keys",
    avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
  },
  {
    name: "Sarah Chen",
    title: "Head of AI Security",
    handle: "sarahc",
    status: "Training models",
    avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
  },
  {
    name: "Marcus Johnson",
    title: "Frontend Architect",
    handle: "marcusj",
    status: "Optimizing WebGL",
    avatarUrl: "https://i.pravatar.cc/150?u=a04258a2462d826712d",
  }
];

export default function Developers() {
  return (
    <section id="developers" className="relative py-32 overflow-hidden bg-black">
      {/* Background gradients */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 100%,rgba(255,255,255,0.04) 0%,transparent 60%)' }}
      />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 120 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16 space-y-4"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
            Meet the Team
          </p>
          <h2 className="text-4xl sm:text-5xl xl:text-6xl font-black text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            The minds behind the shield.
          </h2>
          <p className="text-lg max-w-xl mx-auto text-gray-400">
            Built by industry veterans in cryptography, artificial intelligence, and distributed systems.
          </p>
        </motion.div>

        {/* Profile Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-center justify-center">
          {developers.map((dev, idx) => (
            <motion.div
              key={dev.handle}
              initial={{ opacity: 0, y: 150 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 1.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <ProfileCard
                name={dev.name}
                title={dev.title}
                handle={dev.handle}
                status={dev.status}
                contactText="View Portfolio"
                avatarUrl={dev.avatarUrl}
                showUserInfo={true}
                enableTilt={true}
                behindGlowEnabled={true}
                behindGlowColor="rgba(255, 255, 255, 0.1)"
                innerGradient="linear-gradient(145deg,#111 0%,#222 100%)"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
