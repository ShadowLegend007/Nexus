import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Button from '../components/ui/Button';
import QRDisplay from '../components/contacts/QRDisplay';
import { Radio, Mail, Lock, User, Sparkles, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Track successful signup to reveal assigned hex ID before proceeding
  const [registeredHex, setRegisteredHex] = useState(null);
  
  const register = useAuthStore((state) => state.register);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      toast.error('Please fill in all registration fields.');
      return;
    }

    setLoading(true);
    try {
      const data = await register(username, email, password);
      toast.success('Account security identity generated!');
      setRegisteredHex(data.hexId); // Displays the identity reveal panel
    } catch (err) {
      toast.error(err.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = () => {
    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-background-dark text-text-primaryDark flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-info/10 rounded-full blur-[100px] pointer-events-none" />

      {registeredHex ? (
        /* SUCCESSFUL REGISTER REVEAL CARD */
        <div className="w-full max-w-md glassmorphism border-border-dark/80 rounded-3xl p-8 shadow-2xl relative z-10 flex flex-col items-center space-y-6 text-center animate-scale-up">
          <div className="inline-flex p-3 bg-success/20 text-success border border-success/30 rounded-full">
            <CheckCircle2 size={32} />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-black text-text-primaryDark flex items-center justify-center gap-1.5">
              Secure Identity Generated! <Sparkles size={16} className="text-primary animate-pulse" />
            </h2>
            <p className="text-xs text-text-secondaryDark leading-relaxed">
              This is your permanent SecureChat cryptographic address. Share this Hex code or QR with friends to receive files and text safely.
            </p>
          </div>

          {/* Large display of the QR code canvas */}
          <QRDisplay hexId={registeredHex} username={username} />

          <Button 
            variant="success" 
            onClick={handleProceed} 
            className="w-full py-2.5 bg-success border-success text-white"
          >
            Enter Secure Room
          </Button>
        </div>
      ) : (
        /* REGISTRATION FORM */
        <div className="w-full max-w-md glassmorphism border-border-dark/80 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
          <div className="flex flex-col items-center space-y-2">
            <Link to="/" className="flex items-center space-x-2 outline-none">
              <div className="bg-primary/20 border border-primary/30 p-2 rounded-xl text-primary">
                <Radio size={20} className="pulse-primary" />
              </div>
              <span className="font-black text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-text-primaryDark via-primary to-info uppercase">
                SecureChat
              </span>
            </Link>
            <h2 className="text-xl font-bold tracking-tight pt-2">Generate Hex ID</h2>
            <p className="text-xs text-text-secondaryDark">Set credentials to generate cryptographic key</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-text-secondaryDark uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Anonymous User"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-surface-dark2 border border-border-dark text-text-primaryDark rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm dark:bg-surface-dark2 dark:border-border-dark dark:text-text-primaryDark"
                />
                <User size={16} className="absolute left-3.5 top-3.5 text-text-secondaryDark" />
              </div>
            </div>

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
              Generate Cryptographic Address
            </Button>
          </form>

          <div className="text-xs text-text-secondaryDark pt-2 text-center">
            Already have a Hex code identity?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline outline-none">
              Login here
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegisterPage;
