import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';

let lenisInstance = null;

export function useLenis() {
  useEffect(() => {
    if (lenisInstance) return; // avoid double init in StrictMode

    lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });

    function raf(time) {
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenisInstance.destroy();
      lenisInstance = null;
    };
  }, []);
}
