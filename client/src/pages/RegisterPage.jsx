import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Button from '../components/ui/Button';
import QRDisplay from '../components/contacts/QRDisplay';
import { Radio, Mail, Lock, User, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { NexusLogo } from '../components/ui/NexusLogo';
import { BackendStatusBanner } from '../components/ui/BackendStatusBanner';

export function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  
  // Track successful signup to reveal assigned hex ID before proceeding
  const [registeredHex, setRegisteredHex] = useState(null);
  
  const register = useAuthStore((state) => state.register);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!username || !email || !password) {
      const msg = 'Please fill in all registration fields.';
      setFormError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      const data = await register(username, email, password);
      toast.success('Account security identity generated!');
      setFormError(null);
      setRegisteredHex(data.hexId); // Displays the identity reveal panel
    } catch (err) {
      const msg = err.message || 'Registration failed. Try again.';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = () => {
    navigate('/chat');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans bg-black text-white">
      {/* Return Back Nav */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors z-50 group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-1"><path d="m15 18-6-6 6-6"/></svg>
        Back to Home
      </Link>

      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[100px] pointer-events-none" />

      {registeredHex ? (
        /* SUCCESSFUL REGISTER REVEAL CARD */
        <div className="w-full max-w-md bg-black/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 flex flex-col items-center space-y-6 text-center animate-scale-up">
          <div className="inline-flex p-3 bg-white/10 text-white border border-white/20 rounded-full">
            <CheckCircle2 size={32} />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-black text-white flex items-center justify-center gap-1.5">
              Secure Identity Generated! <Sparkles size={16} className="text-white animate-pulse" />
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              This is your permanent Nexus cryptographic address. Share this Hex code or QR with friends to receive files and text safely.
            </p>
          </div>

          {/* Large display of the QR code canvas */}
          <QRDisplay hexId={registeredHex} username={username} />

          <Button 
            variant="success" 
            onClick={handleProceed} 
            className="w-full py-2.5 bg-white text-black border-white hover:bg-gray-200"
          >
            Enter Secure Room
          </Button>
        </div>
      ) : (
        /* REGISTRATION FORM */
        <div className="w-full max-w-md bg-black/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
          
          {/* Backend Status Banner */}
          <BackendStatusBanner inline={true} />

          <div className="flex flex-col items-center space-y-2">
            <Link to="/" className="flex items-center space-x-2 outline-none pb-2">
              <NexusLogo size={20} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
            </Link>
            <h2 className="text-xl font-bold tracking-tight pt-2 text-white">Generate Hex ID</h2>
            <p className="text-xs text-gray-400">Set credentials to generate cryptographic key</p>
          </div>

          {/* Inline Fallback Error Banner */}
          {formError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3.5 flex items-start space-x-3 text-red-300 text-xs">
              <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="font-semibold text-red-200">{formError}</p>
                {formError.toLowerCase().includes('already exists') && (
                  <p className="text-[11px] text-red-300/80">
                    Already registered?{' '}
                    <Link to="/login" className="text-white underline font-semibold hover:text-red-200">
                      Login here instead
                    </Link>
                  </p>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Anonymous User"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  className="w-full rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all text-sm"
                  style={{
                    background: '#111',
                    border: '1px solid #333',
                    color: '#fff',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#fff'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(255,255,255,0.1)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.boxShadow = 'none'; }}
                />
                <User size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="you@domain.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  className="w-full rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all text-sm"
                  style={{
                    background: '#111',
                    border: formError && formError.toLowerCase().includes('already exists') ? '1px solid rgba(239, 68, 68, 0.6)' : '1px solid #333',
                    color: '#fff',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#fff'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(255,255,255,0.1)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = formError && formError.toLowerCase().includes('already exists') ? 'rgba(239, 68, 68, 0.6)' : '#333'; e.currentTarget.style.boxShadow = 'none'; }}
                />
                <Mail size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  className="w-full rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all text-sm"
                  style={{
                    background: '#111',
                    border: '1px solid #333',
                    color: '#fff',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#fff'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(255,255,255,0.1)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.boxShadow = 'none'; }}
                />
                <Lock size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-white text-black font-bold rounded-xl border border-white hover:bg-gray-200 transition-colors mt-2 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Cryptographic Address'}
            </button>
          </form>

          <div className="text-xs text-gray-400 pt-2 text-center">
            Already have a Hex code identity?{' '}
            <Link to="/login" className="text-white font-semibold hover:underline outline-none">
              Login here
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegisterPage;
