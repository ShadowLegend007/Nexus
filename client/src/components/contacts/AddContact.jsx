import React, { useState } from 'react';
import { UserPlus, QrCode, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { resolveHexId, addContact } from '../../api/contacts';
import { formatHexId, stripHexId } from '../../utils/hexGenerator';
import Button from '../ui/Button';
import QRScanner from './QRScanner';
import Avatar from '../ui/Avatar';
import toast from 'react-hot-toast';

export function AddContact({ onContactAdded }) {
  const [hexInput, setHexInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [resolvedUser, setResolvedUser] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [error, setError] = useState(null);

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

  const handleAdd = async () => {
    if (!resolvedUser) return;

    setLoading(true);
    try {
      await addContact(resolvedUser.hexId);
      toast.success(`${resolvedUser.username} added to contacts!`);
      setResolvedUser(null);
      setHexInput('');
      if (onContactAdded) onContactAdded();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add contact.');
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
          <div>
            <label className="block text-xs font-semibold text-text-secondaryDark mb-2 uppercase tracking-wider dark:text-text-secondaryDark light:text-text-secondaryLight">
              Enter Hex Code / Identity
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="XXXX-XXXX-XXXX"
                  value={hexInput}
                  onChange={handleInputChange}
                  maxLength={14} // 12 hex + 2 dashes
                  className="w-full bg-surface-dark2 border border-border-dark text-text-primaryDark rounded-xl pl-4 pr-10 py-2.5 font-mono tracking-wider placeholder-text-mutedDark focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all dark:bg-surface-dark2 dark:border-border-dark dark:text-text-primaryDark light:bg-surface-light2 light:border-border-light light:text-text-primaryLight"
                />
                <Search size={18} className="absolute right-3 top-3 text-text-mutedDark" />
              </div>
              <Button
                variant="outline"
                type="button"
                onClick={() => setShowScanner(true)}
                className="!px-3 border-primary/40 text-primary hover:bg-primary/10"
              >
                <QrCode size={18} />
              </Button>
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
            variant="primary"
            disabled={stripHexId(hexInput).length !== 12 || loading}
            loading={loading}
            className="w-full bg-primary border-primary py-2.5"
          >
            Resolve Hex ID
          </Button>
        </form>
      )}

      {/* Resolved User Card Display */}
      {resolvedUser && (
        <div className="border border-success/30 bg-success/5 rounded-2xl p-4 flex flex-col items-center text-center space-y-4 animate-fade-in">
          <div className="flex items-center text-success font-bold text-xs uppercase tracking-wider">
            <CheckCircle2 size={16} className="mr-1.5" />
            Identity Verified
          </div>

          <Avatar src={resolvedUser.avatar} name={resolvedUser.username} size="lg" />

          <div>
            <h4 className="font-bold text-text-primaryDark dark:text-text-primaryDark light:text-text-primaryLight">
              {resolvedUser.username}
            </h4>
            <span className="font-mono text-xs text-primary block mt-0.5">
              {formatHexId(resolvedUser.hexId)}
            </span>
          </div>

          <Button
            variant="success"
            onClick={handleAdd}
            loading={loading}
            className="w-full bg-success border-success"
          >
            <UserPlus size={16} className="mr-2" />
            Add to Contacts
          </Button>
        </div>
      )}
    </div>
  );
}

export default AddContact;
