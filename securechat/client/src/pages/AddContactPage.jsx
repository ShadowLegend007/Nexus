import React from 'react';
import { useNavigate } from 'react-router-dom';
import AddContact from '../components/contacts/AddContact';
import Button from '../components/ui/Button';
import { ArrowLeft, UserPlus, Shield } from 'lucide-react';

export function AddContactPage() {
  const navigate = useNavigate();

  const handleContactAdded = () => {
    // Redirect back to chat page on success to begin conversing
    setTimeout(() => {
      navigate('/chat');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background-dark text-text-primaryDark flex flex-col font-sans dark:bg-background-dark dark:text-text-primaryDark light:bg-background-light light:text-text-primaryLight">
      {/* Navbar Header */}
      <header className="px-6 py-4 border-b border-border-dark dark:border-border-dark light:border-border-light bg-surface-dark/40 dark:bg-surface-dark/40 light:bg-surface-light/40 backdrop-blur z-10">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate('/chat')}
            className="!py-1.5 !px-3 hover:bg-surface-dark2"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>

          <div className="flex items-center space-x-2">
            <Shield size={18} className="text-primary animate-pulse" />
            <span className="font-bold text-sm tracking-wider uppercase">
              Add Secure Contact
            </span>
          </div>

          <div className="w-[80px]" /> {/* Spacer */}
        </div>
      </header>

      {/* Composition Area */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-surface-dark border border-border-dark rounded-3xl p-6 md:p-8 shadow-xl text-left dark:bg-surface-dark dark:border-border-dark light:bg-surface-light light:border-border-light animate-scale-up">
          <div className="flex flex-col items-center text-center space-y-2 mb-6">
            <div className="p-3 bg-primary/10 text-primary border border-primary/20 rounded-2xl">
              <UserPlus size={24} />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Expand Network</h2>
            <p className="text-xs text-text-secondaryDark">Scan friend's QR or key in Hex ID digits</p>
          </div>

          <AddContact onContactAdded={handleContactAdded} />
        </div>
      </main>
    </div>
  );
}

export default AddContactPage;
