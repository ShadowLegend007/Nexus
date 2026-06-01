import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Button from '../components/ui/Button';
import { Shield, Mail, Lock, Radio } from 'lucide-react';
import toast from 'react-hot-toast';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Logged in successfully!');
      navigate('/chat');
    } catch (err) {
      toast.error(err.message || 'Login failed. Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-dark text-text-primaryDark flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-info/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md glassmorphism border-border-dark/80 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
        
        {/* Header brand logo */}
        <div className="flex flex-col items-center space-y-2">
          <Link to="/" className="flex items-center space-x-2 outline-none">
            <div className="bg-primary/20 border border-primary/30 p-2 rounded-xl text-primary">
              <Radio size={20} className="pulse-primary" />
            </div>
            <span className="font-black text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-text-primaryDark via-primary to-info uppercase">
              SecureChat
            </span>
          </Link>
          <h2 className="text-xl font-bold tracking-tight pt-2">Enter Secure Room</h2>
          <p className="text-xs text-text-secondaryDark">Input credentials to load security keys</p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-text-secondaryDark uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-dark2 border border-border-dark text-text-primaryDark rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm dark:bg-surface-dark2 dark:border-border-dark dark:text-text-primaryDark"
              />
              <Mail size={16} className="absolute left-3.5 top-3.5 text-text-secondaryDark" />
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-text-secondaryDark uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-dark2 border border-border-dark text-text-primaryDark rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm dark:bg-surface-dark2 dark:border-border-dark dark:text-text-primaryDark"
              />
              <Lock size={16} className="absolute left-3.5 top-3.5 text-text-secondaryDark" />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="w-full py-2.5 bg-primary border-primary mt-2"
          >
            Access Dashboard
          </Button>
        </form>

        {/* Navigation bottom toggle */}
        <div className="text-xs text-text-secondaryDark pt-2 text-center">
          Don't have a Hex code identity?{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline outline-none">
            Generate one here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
