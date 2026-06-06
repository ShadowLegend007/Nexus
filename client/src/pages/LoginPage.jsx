import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Button from '../components/ui/Button';
import { Shield, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { NexusLogo } from '../components/ui/NexusLogo';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('LOGIN'); // 'LOGIN', 'FORGOT_EMAIL', 'FORGOT_OTP', 'FORGOT_RESET'
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const { login, forgotPassword, verifyOtp, resetPassword } = useAuthStore();
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

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email.');
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email);
      toast.success('OTP sent to your email.');
      setStep('FORGOT_OTP');
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error('Please enter the OTP.');
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(email, otp);
      toast.success('OTP verified!');
      setStep('FORGOT_RESET');
    } catch (err) {
      toast.error(err.message || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword) {
      toast.error('Please enter a new password.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email, otp, newPassword);
      toast.success('Password reset successfully! Please login.');
      setStep('LOGIN');
      setPassword('');
      setOtp('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
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
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-black/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
        
        {/* Header brand logo */}
        <div className="flex flex-col items-center space-y-2">
          <Link to="/" className="flex items-center space-x-2 outline-none pb-2">
            <NexusLogo size={20} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
          </Link>
          <h2 className="text-xl font-bold tracking-tight pt-2 text-white">
            {step === 'LOGIN' && 'Enter Secure Room'}
            {step === 'FORGOT_EMAIL' && 'Reset Password'}
            {step === 'FORGOT_OTP' && 'Verify OTP'}
            {step === 'FORGOT_RESET' && 'Set New Password'}
          </h2>
          <p className="text-xs text-gray-400">
            {step === 'LOGIN' && 'Input credentials to load security keys'}
            {step === 'FORGOT_EMAIL' && 'Enter your email to receive an OTP'}
            {step === 'FORGOT_OTP' && 'Enter the 4-digit code sent to your email'}
            {step === 'FORGOT_RESET' && 'Choose a strong new password'}
          </p>
        </div>

        {/* Dynamic Form based on Step */}
        {step === 'LOGIN' && (
          <form onSubmit={handleLogin} className="space-y-4">
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
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all text-sm"
                  style={{ background: '#111', border: '1px solid #333', color: '#fff' }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#fff'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(255,255,255,0.1)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.boxShadow = 'none'; }}
                />
                <Mail size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider flex justify-between items-center">
                <span>Password</span>
                <button type="button" onClick={() => setStep('FORGOT_EMAIL')} className="text-gray-500 hover:text-white capitalize tracking-normal">Forgot?</button>
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all text-sm"
                  style={{ background: '#111', border: '1px solid #333', color: '#fff' }}
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
              {loading ? 'Accessing...' : 'Access Dashboard'}
            </button>
            <div className="text-xs text-gray-400 pt-2 text-center">
              Don't have a Hex code identity?{' '}
              <Link to="/register" className="text-white font-semibold hover:underline outline-none">
                Generate one here
              </Link>
            </div>
          </form>
        )}

        {step === 'FORGOT_EMAIL' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
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
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all text-sm"
                  style={{ background: '#111', border: '1px solid #333', color: '#fff' }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#fff'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(255,255,255,0.1)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.boxShadow = 'none'; }}
                />
                <Mail size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-white text-black font-bold rounded-xl border border-white hover:bg-gray-200 transition-colors mt-2 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
            <button type="button" onClick={() => setStep('LOGIN')} className="w-full py-2.5 bg-transparent text-white font-bold rounded-xl border border-white/20 hover:bg-white/5 transition-colors mt-2">
              Cancel
            </button>
          </form>
        )}

        {step === 'FORGOT_OTP' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                4-Digit OTP
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={4}
                  required
                  placeholder="1234"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all text-sm tracking-[1em]"
                  style={{ background: '#111', border: '1px solid #333', color: '#fff' }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#fff'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(255,255,255,0.1)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.boxShadow = 'none'; }}
                />
                <Shield size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-white text-black font-bold rounded-xl border border-white hover:bg-gray-200 transition-colors mt-2 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button type="button" onClick={() => setStep('FORGOT_EMAIL')} className="w-full py-2.5 bg-transparent text-white font-bold rounded-xl border border-white/20 hover:bg-white/5 transition-colors mt-2">
              Back
            </button>
          </form>
        )}

        {step === 'FORGOT_RESET' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all text-sm"
                  style={{ background: '#111', border: '1px solid #333', color: '#fff' }}
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
              {loading ? 'Saving...' : 'Set New Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
