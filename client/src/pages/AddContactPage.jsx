import React from 'react';
import { useNavigate } from 'react-router-dom';
import AddContact from '../components/contacts/AddContact';
import { ArrowLeft, UserPlus, Shield } from 'lucide-react';
import { Card } from '../components/ui/Card';

export function AddContactPage() {
  const navigate = useNavigate();

  const handleContactAdded = () => {
    setTimeout(() => {
      navigate('/chat');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      {/* Navbar Header */}
      <header className="px-6 py-4 card border-x-0 border-t-0 rounded-none z-10">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/chat')}
            className="flex items-center text-sm font-medium text-text-secondaryLight dark:text-text-secondaryDark hover:text-white transition-colors group"
          >
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>

          <div className="flex items-center space-x-2">
            <Shield size={18} className="text-primary animate-pulse" />
            <span className="font-display font-bold text-sm tracking-wider uppercase">
              Secure Network
            </span>
          </div>

          <div className="w-[60px]" /> {/* Spacer */}
        </div>
      </header>

      {/* Composition Area */}
      <main className="flex-1 flex items-center justify-center p-6 page-transition">
        <Card className="w-full max-w-md p-8 text-left">
          <div className="flex flex-col items-center text-center space-y-3 mb-8">
            <div
              className="relative p-4 rounded-full mb-2 group-hover:scale-110 transition-transform"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary animate-draw">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" className="text-accent" />
                <line x1="22" y1="11" x2="16" y2="11" className="text-accent" />
              </svg>
            </div>
            <h2 className="text-3xl font-display font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Expand Network
            </h2>
            <p className="text-sm text-text-secondaryLight dark:text-text-secondaryDark font-medium">Scan a QR code or enter a unique Hex ID</p>
          </div>

          <AddContact onContactAdded={handleContactAdded} />
        </Card>
      </main>
    </div>
  );
}

export default AddContactPage;
