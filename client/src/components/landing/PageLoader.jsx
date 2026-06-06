import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NexusLogo } from '../ui/NexusLogo';

export default function PageLoader({ onComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 3100; // 3.1 seconds (matches text animation exactly: 1.6s delay + 1.5s draw)
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(onComplete, 100); // Small buffer before unmounting
      }
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black"
    >
      <div className="flex flex-col items-center space-y-6">
        <motion.div
          layoutId="nexus-logo"
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
        >
          <NexusLogo animated={true} size={100} />
        </motion.div>
        
        <div className="flex flex-col items-center space-y-2 mt-4">
          <p className="text-xs text-gray-500 font-mono tracking-widest">
            INITIALIZING SECURE PROTOCOLS
          </p>
        </div>

        {/* Loading Bar */}
        <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden mt-8">
          <motion.div
            className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
            initial={{ width: '0%' }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ ease: "linear" }}
          />
        </div>
        <div className="text-[10px] text-gray-600 font-mono">
          {Math.min(Math.round(progress), 100)}%
        </div>
      </div>
    </motion.div>
  );
}
