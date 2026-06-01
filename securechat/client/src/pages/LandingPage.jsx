import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, EyeOff, Radio, QrCode, Cpu, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background-dark text-text-primaryDark flex flex-col justify-between overflow-hidden relative font-sans">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-info/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Header navbar */}
      <header className="max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
          <div className="bg-primary/20 border border-primary/30 p-2 rounded-xl text-primary">
            <Radio size={20} className="pulse-primary" />
          </div>
          <span className="font-black text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-text-primaryDark via-primary to-info uppercase">
            SecureChat
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <Link to="/login" className="text-sm font-semibold hover:text-primary transition-colors">
            Login
          </Link>
          <Link to="/register">
            <Button variant="primary" className="!py-1.5 !px-4">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero section */}
      <main className="max-w-7xl w-full mx-auto px-6 flex-1 flex flex-col lg:flex-row items-center justify-center py-12 lg:py-24 gap-12 z-10">
        <div className="flex-1 space-y-8 text-left">
          <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 px-3.5 py-1 rounded-full text-xs font-bold text-primary">
            <ShieldCheck size={14} />
            <span>AI-Powered Active Threat Protection</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1]">
            Next-Gen Chat <br />
            With <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-info to-success">AI Shielding</span>
          </h1>

          <p className="text-text-secondaryDark text-base sm:text-lg leading-relaxed max-w-lg">
            Experience absolute communications anonymity. Exchanging messages through highly secure, private Hex keys. Powered by real-time dual-tier machine learning threat scans protecting files, scripts, and attachments.
          </p>

          <div className="flex gap-4">
            <Link to="/register">
              <Button variant="primary" className="!py-3 !px-6 bg-primary border-primary">
                Create Secure Hex ID
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
            
            <Link to="/login">
              <Button variant="outline" className="!py-3 !px-6">
                Enter Chatroom
              </Button>
            </Link>
          </div>
        </div>

        {/* Visual Graphic card */}
        <div className="flex-1 w-full max-w-md lg:max-w-none flex justify-center">
          <div className="glassmorphism rounded-3xl p-6 w-full max-w-md space-y-6 relative overflow-hidden border-border-dark/80 shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between pb-4 border-b border-border-dark/40">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary font-mono text-sm shadow-md">
                  SC
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-bold text-text-primaryDark">AI Shield System</h4>
                  <span className="text-[10px] text-success font-semibold flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-ping mr-1" />
                    Inspection Online
                  </span>
                </div>
              </div>
              <Cpu size={18} className="text-primary animate-pulse" />
            </div>

            {/* Simulated scan display */}
            <div className="space-y-4">
              <div className="p-3 bg-surface-dark2 border border-border-dark/60 rounded-xl space-y-2 text-left relative overflow-hidden dark:bg-surface-dark2">
                <div className="text-[10px] font-bold text-text-secondaryDark uppercase tracking-wider">
                  Scanning Attachment...
                </div>
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded bg-warning/20 border border-warning/30 flex items-center justify-center text-warning font-black text-[10px]">
                    PDF
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="text-xs font-bold truncate">security_manifest_2026.pdf</div>
                    <div className="w-full bg-surface-dark h-1 rounded overflow-hidden">
                      <div className="bg-warning h-full animate-infinite-progress" style={{ width: '65%' }} />
                    </div>
                  </div>
                </div>
                <div className="text-[9px] text-warning font-semibold animate-pulse flex items-center">
                  🔬 Inspecting sandbox heuristics (Tier 2)...
                </div>
              </div>

              <div className="p-3 bg-danger/10 border border-danger/30 rounded-xl space-y-1.5 text-left">
                <div className="text-[10px] font-bold text-danger uppercase tracking-wider flex items-center">
                  <ShieldCheck size={12} className="mr-1" />
                  Threat blocked & quarantined
                </div>
                <div className="text-xs font-semibold">payload_exploit.exe</div>
                <div className="text-[10px] text-text-secondaryDark font-mono">
                  Type: PDF_EXPLOIT (98% confidence)
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border-dark/30 z-10">
        <div className="max-w-7xl w-full mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-text-mutedDark gap-4">
          <span>&copy; 2026 SecureChat Inc. All rights reserved.</span>
          <div className="flex space-x-6">
            <span className="hover:text-text-secondaryDark cursor-pointer">Security Heuristics</span>
            <span className="hover:text-text-secondaryDark cursor-pointer">Zero-Knowledge</span>
            <span className="hover:text-text-secondaryDark cursor-pointer">ML Integrations</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
