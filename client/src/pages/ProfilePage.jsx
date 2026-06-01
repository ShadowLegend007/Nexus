import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import HexCodeCard from '../components/profile/HexCodeCard';
import ProfileSettings from '../components/profile/ProfileSettings';
import Button from '../components/ui/Button';
import { ArrowLeft, Shield, User } from 'lucide-react';

export function ProfilePage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background-dark text-text-primaryDark flex flex-col font-sans dark:bg-background-dark dark:text-text-primaryDark light:bg-background-light light:text-text-primaryLight">
      {/* Top Navbar */}
      <header className="px-6 py-4 border-b border-border-dark dark:border-border-dark light:border-border-light bg-surface-dark/40 dark:bg-surface-dark/40 light:bg-surface-light/40 backdrop-blur z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate('/chat')}
            className="!py-1.5 !px-3 hover:bg-surface-dark2"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Chat
          </Button>

          <div className="flex items-center space-x-2">
            <Shield size={18} className="text-primary animate-pulse" />
            <span className="font-bold text-sm tracking-wider uppercase">
              Secure Profile Panel
            </span>
          </div>

          <div className="w-[100px]" /> {/* Spacer to align title */}
        </div>
      </header>

      {/* Main split grid layout */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:py-12 flex flex-col md:flex-row gap-8 items-start overflow-y-auto">
        {/* Left Side: Identity Hex Card */}
        <div className="w-full md:w-5/12 flex-shrink-0 animate-scale-up">
          <HexCodeCard hexId={user?.hexId} username={user?.username} />
        </div>

        {/* Right Side: Account Settings Composition */}
        <div className="w-full md:w-7/12 bg-surface-dark border border-border-dark rounded-3xl p-6 md:p-8 shadow-xl text-left dark:bg-surface-dark dark:border-border-dark light:bg-surface-light light:border-border-light animate-fade-in">
          <ProfileSettings />
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;
