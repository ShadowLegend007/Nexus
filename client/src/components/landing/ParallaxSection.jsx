import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function ParallaxSection() {
  const ref = useRef();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  const yText = useTransform(scrollYProgress, [0, 1], ['-20%', '20%']);
  const yBlob1 = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const yBlob2 = useTransform(scrollYProgress, [0, 1], ['20%', '-20%']);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

  return (
    <section ref={ref} className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background blobs (monochrome) */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full mix-blend-screen"
        style={{ background: 'radial-gradient(circle,rgba(255,255,255,0.05) 0%,transparent 70%)', filter: 'blur(60px)', y: yBlob1 }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] rounded-full mix-blend-screen"
        style={{ background: 'radial-gradient(circle,rgba(255,255,255,0.03) 0%,transparent 70%)', filter: 'blur(80px)', y: yBlob2 }}
      />

      <motion.div style={{ y: yText, scale }} className="relative z-10 text-center px-6">
        <h2 className="text-5xl sm:text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Absolute Control.
        </h2>
        <p className="text-xl sm:text-2xl mt-6 text-gray-400 font-medium tracking-wide">
          Your keys. Your data. Your privacy.
        </p>
      </motion.div>

      {/* Grid lines (monochrome) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '4rem 4rem' }} />
    </section>
  );
}
