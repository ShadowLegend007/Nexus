import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Antigravity from '../reactbits/Antigravity';

const VP = { once: true, amount: 0.15 };

export default function CTA() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || window.matchMedia("(pointer: coarse)").matches);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <section className="relative py-36 overflow-hidden bg-black">
      {!isMobile && (
        <div className="absolute inset-0 z-0">
          <Antigravity
            count={300}
            magnetRadius={6}
            ringRadius={7}
            waveSpeed={0.4}
            waveAmplitude={1}
            particleSize={1.5}
            lerpSpeed={0.05}
            color={'#ffffff'}
            autoAnimate={false}
            particleVariance={1}
            rotationSpeed={0}
            depthFactor={1}
            pulseSpeed={3}
            particleShape="capsule"
            fieldStrength={10}
          />
        </div>
      )}

      {/* Grid overlay (monochrome) */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 120 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VP}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-8"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={VP}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest bg-white/5 border border-white/10 text-gray-300"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          Start For Free Today
        </motion.div>

        <h2 className="text-4xl sm:text-5xl xl:text-6xl font-black leading-tight text-white">
          Secure Conversations.<br />Zero Compromise.
        </h2>

        <p className="text-lg max-w-2xl mx-auto text-gray-400">
          Join thousands who trust Nexus for communications that stay private — always.
          No surveillance. No backdoors. No exceptions.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register">
            <motion.button
              id="cta-final-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="group inline-flex items-center gap-2 text-sm font-bold px-8 py-4 rounded-xl bg-white text-black hover:bg-gray-200 transition-colors shadow-[0_4px_24px_rgba(255,255,255,0.1)]"
            >
              Create Secure Identity
              <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
            </motion.button>
          </Link>
          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-2 text-sm font-bold px-8 py-4 rounded-xl border border-white/20 text-white bg-white/5 hover:bg-white/10 transition-colors"
            >
              Sign In
            </motion.button>
          </Link>
        </div>
      </motion.div>

      <style>{`
        @keyframes aurora {
          0%   { opacity: 0.6; transform: scale(1) rotate(0deg); }
          50%  { opacity: 1;   transform: scale(1.05) rotate(1deg); }
          100% { opacity: 0.7; transform: scale(0.98) rotate(-1deg); }
        }
      `}</style>
    </section>
  );
}
