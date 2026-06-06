import React from 'react';
import { motion } from 'framer-motion';

export function NexusLogo({ animated = false, size = 100, className = '' }) {
  const letters = [
    { id: 'N', d: "M 0 50 L 0 0 L 30 50 L 30 0" },
    { id: 'E', d: "M 80 0 L 50 0 L 50 50 L 80 50 M 50 25 L 75 25" },
    { id: 'X', d: "M 100 0 L 130 50 M 130 0 L 100 50" },
    { id: 'U', d: "M 150 0 L 150 35 Q 150 50 165 50 Q 180 50 180 35 L 180 0" },
    { id: 'S', d: "M 230 0 L 210 0 Q 200 0 200 12.5 Q 200 25 215 25 Q 230 25 230 37.5 Q 230 50 210 50 L 200 50" }
  ];

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg 
        width={size * 2.4} 
        height={size} 
        viewBox="-5 -10 245 70" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="6" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        {letters.map((letter, i) => {
          if (animated) {
            return (
              <motion.path
                key={letter.id}
                d={letter.d}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  duration: 1.5,
                  ease: "easeInOut",
                  delay: i * 0.4
                }}
              />
            );
          }
          return <path key={letter.id} d={letter.d} />;
        })}
      </svg>
    </div>
  );
}

export default NexusLogo;
