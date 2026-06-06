import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { useLenis } from '../hooks/useLenis';
import { AnimatePresence, LayoutGroup } from 'framer-motion';

// Landing-specific components
import PageLoader from '../components/landing/PageLoader';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import AISecurity from '../components/landing/AISecurity';
import ParallaxSection from '../components/landing/ParallaxSection';
import Architecture from '../components/landing/Architecture';
import Stats from '../components/landing/Stats';
import Developers from '../components/landing/Developers';
import FAQ from '../components/landing/FAQ';
import CTA from '../components/landing/CTA';
import Footer from '../components/landing/Footer';

export function LandingPage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Smooth scrolling
  useLenis();

  // Redirect authenticated users
  useEffect(() => {
    if (isAuthenticated) navigate('/chat', { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <div
      style={{
        backgroundColor: '#000000',
        color: '#ffffff',
        overflowX: 'hidden',
      }}
    >
      <LayoutGroup>
        <AnimatePresence>
          {loading && <PageLoader key="loader" onComplete={() => setLoading(false)} />}
        </AnimatePresence>

        <Navbar loading={loading} />
      </LayoutGroup>
      <Hero />
      <Features />
      <AISecurity />
      <ParallaxSection />
      <Architecture />
      <Stats />
      <Developers />
      <FAQ />
      <CTA />
    </div>
  );
}

export default LandingPage;
