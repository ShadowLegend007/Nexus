import React, { useState } from 'react';
import { UserPlus, QrCode, Search, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';
import { resolveHexId } from '../../api/contacts';
import { startConversation } from '../../api/conversations';
import useChatStore from '../../store/chatStore';
import { useNavigate } from 'react-router-dom';
import { formatHexId, stripHexId } from '../../utils/hexGenerator';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { AvatarRing } from '../ui/AvatarRing';
import { VerifiedBadge } from '../ui/VerifiedBadge';
import { Card } from '../ui/Card';
import QRScanner from './QRScanner';
import toast from 'react-hot-toast';

export function AddContact({ onContactAdded }) {
  const [hexInput, setHexInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [resolvedUser, setResolvedUser] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [error, setError] = useState(null);
  const { setActiveConversation, conversations, setConversations } = useChatStore();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setError(null);
    setResolvedUser(null);
    const value = e.target.value;
    setHexInput(formatHexId(value));
  };

  const handleResolve = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setResolvedUser(null);

    const rawHex = stripHexId(hexInput);
    if (rawHex.length !== 12) {
      setError('Hex ID must be exactly 12 characters.');
      return;
    }

    setLoading(true);
    try {
      const user = await resolveHexId(rawHex);
      setResolvedUser(user);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resolve Hex ID.');
    } finally {
      setLoading(false);
    }
  };

  const handleScanSuccess = async (decodedText) => {
    setShowScanner(false);
    setHexInput(formatHexId(decodedText));
    setError(null);
    setResolvedUser(null);
    
    const rawHex = stripHexId(decodedText);
    setLoading(true);
    try {
      const user = await resolveHexId(rawHex);
      setResolvedUser(user);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resolve scanned Hex ID.');
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = async () => {
    if (!resolvedUser) return;

    setLoading(true);
    try {
      const conv = await startConversation(resolvedUser.hexId);
      
      if (!conversations.find((c) => c._id === conv._id)) {
        setConversations([conv, ...conversations]);
      }
      setActiveConversation(conv);
      navigate('/chat');
      
      setResolvedUser(null);
      setHexInput('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start chat.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {showScanner ? (
        <QRScanner
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      ) : (
        <form onSubmit={handleResolve} className="space-y-4">
          <div className="space-y-4">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Input
                  label="Hex Identity Code"
                  icon={Search}
                  value={hexInput}
                  onChange={handleInputChange}
                  maxLength={14}
                  placeholder="XXXX-XXXX-XXXX"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                className="h-[46px] w-[46px] flex items-center justify-center mb-0.5 rounded-xl transition-all flex-shrink-0"
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-input)',
                  color: 'var(--accent)',
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-input)'; e.currentTarget.style.background = 'var(--bg-input)'; }}
              >
                <QrCode size={20} />
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center text-xs text-danger space-x-1 bg-danger/10 border border-danger/20 rounded-lg p-2.5">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={stripHexId(hexInput).length !== 12 || loading}
            loading={loading}
            className="w-full"
          >
            Resolve Identity
          </Button>
        </form>
      )}

      {/* Resolved User Card Display */}
      {resolvedUser && (
        <Card className="mt-6 p-6 flex flex-col items-center text-center space-y-4 animate-fade-in border-success/30">
          <VerifiedBadge text="Identity Verified" />

          <AvatarRing src={resolvedUser.avatar} name={resolvedUser.username} size="xl" />

          <div>
            <h4 className="font-display font-bold text-lg text-white">
              {resolvedUser.username}
            </h4>
            <span className="font-mono text-sm text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent block mt-1">
              {formatHexId(resolvedUser.hexId)}
            </span>
          </div>

          <button
            onClick={handleMessage}
            disabled={loading}
            className="w-full relative overflow-hidden group flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-white transition-all bg-success/20 border border-success/40 hover:bg-success/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            <MessageSquare size={18} />
            Initialize Connection
          </button>
        </Card>
      )}
    </div>
  );
}

export default AddContact;
