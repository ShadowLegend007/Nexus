import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import HexCodeCard from '../components/profile/HexCodeCard';
import ProfileSettings from '../components/profile/ProfileSettings';
import { ArrowLeft, Shield, LogOut } from 'lucide-react';
import { Card } from '../components/ui/Card';
import toast from 'react-hot-toast';

export function ProfilePage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully.');
    navigate('/login');
  };

  return (
    <div className="h-screen flex flex-col font-sans overflow-hidden" style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      {/* Top Navbar — fixed height to match chat page header */}
      <header
        className="flex-shrink-0 px-4 sm:px-6 border-x-0 border-t-0 rounded-none z-10"
        style={{
          background: 'var(--bg-sidebar)',
          backdropFilter: 'var(--backdrop)',
          borderBottom: '1px solid var(--border-primary)',
          height: '60px',
          minHeight: '60px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={() => navigate('/chat', { replace: true })}
            className="flex items-center text-xs sm:text-sm font-medium transition-colors group flex-shrink-0"
            style={{ color: 'var(--text-secondary)' }}
            onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <ArrowLeft size={15} className="mr-1.5 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden xs:inline">Back to Chat</span>
            <span className="xs:hidden">Back</span>
          </button>

          <div className="flex items-center gap-1.5">
            <Shield size={16} className="text-primary animate-pulse flex-shrink-0" style={{ color: 'var(--accent)' }} />
            <span
              className="font-display font-bold text-[11px] sm:text-sm tracking-wider uppercase hidden sm:block"
              style={{ color: 'var(--text-primary)' }}
            >
              Settings
            </span>
            <span
              className="font-display font-bold text-[11px] tracking-wider uppercase sm:hidden"
              style={{ color: 'var(--text-primary)' }}
            >
              Settings
            </span>
          </div>

          {/* Spacer */}
          <div className="w-16 sm:w-[100px] flex-shrink-0" />
        </div>
      </header>

      {/* Main split grid layout */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-3 sm:p-4 md:py-6 flex flex-col md:flex-row gap-4 md:gap-6 items-start overflow-hidden page-transition">

        {/* Left Side: Identity Hex Card & Logout (Hidden on mobile) */}
        <div className="hidden md:flex md:w-5/12 flex-shrink-0 flex-col space-y-3">
          <HexCodeCard hexId={user?.hexId} username={user?.username} />

        </div>

        {/* Right Side: Account Settings */}
        <Card className="w-full md:w-7/12 p-4 sm:p-6 text-left flex flex-col md:h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
            <ProfileSettings />
          </div>
        </Card>
      </main>
    </div>
  );
}

export default ProfilePage;
