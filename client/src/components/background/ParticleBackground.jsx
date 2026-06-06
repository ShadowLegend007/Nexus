import React, { useEffect, useState } from 'react';

export function ParticleBackground() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate static particle positions once
    const newParticles = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.2 + 0.05,
      animationDuration: Math.random() * 20 + 20, // 20s - 40s
      animationDelay: Math.random() * -40,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none -z-50 overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_#1a0533_0%,_#04040a_50%,_#001a2e_100%)]">
      {/* Grid overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03]" 
        style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}
      ></div>

      {/* Orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-[350px] h-[350px] rounded-full bg-primary/20 blur-[100px] animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] rounded-full bg-secondary/20 blur-[100px] animate-pulse" style={{ animationDuration: '12s' }}></div>
      <div className="absolute top-[20%] left-[-10%] w-[250px] h-[250px] rounded-full bg-accent/15 blur-[90px] animate-pulse" style={{ animationDuration: '10s' }}></div>

      {/* Particles */}
      <div className="absolute inset-0 z-10">
        <style>
          {`
            @keyframes drift {
              0% { transform: translate(0, 0); }
              33% { transform: translate(30px, -50px); }
              66% { transform: translate(-20px, -20px); }
              100% { transform: translate(0, 0); }
            }
          `}
        </style>
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              animation: `drift ${p.animationDuration}s infinite ease-in-out`,
              animationDelay: `${p.animationDelay}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
