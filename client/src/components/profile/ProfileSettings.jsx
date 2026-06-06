import React, { useState, useRef, useEffect, useCallback } from 'react';
import { User, Shield, MessageSquare, Save, Lock, LogOut, Camera, Upload, X, Crop, RotateCcw, RotateCw, ZoomIn, Check, Sun, Moon, Eye, Bell, Bot, FileText, File, Image as ImageIcon, Video, RefreshCw, Star, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useUiStore from '../../store/uiStore';
import { updateProfile } from '../../api/auth';
import { uploadFile } from '../../api/upload';
import { PRESET_AVATARS } from '../../utils/presetAssets';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { AvatarRing } from '../ui/AvatarRing';
import { Modal } from '../ui/Modal';
import toast from 'react-hot-toast';

// ─── Canvas Cropper ────────────────────────────────────────────────────────────
function AvatarCropper({ imageSrc, onSave, onCancel }) {
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imgRef = useRef(new Image());
  const CANVAS_SIZE = 300;
  const CROP_RADIUS = 130;

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = imgRef.current;
    if (!img.complete || !img.naturalWidth) return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Dark background
    ctx.fillStyle = '#0D1117';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw image transformed
    ctx.save();
    ctx.translate(CANVAS_SIZE / 2 + offset.x, CANVAS_SIZE / 2 + offset.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    const scale = Math.max(
      (CANVAS_SIZE / img.naturalWidth) * 1.2,
      (CANVAS_SIZE / img.naturalHeight) * 1.2
    );
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();

    // Dim overlay outside circle
    ctx.fillStyle = 'rgba(0,0,0,0.62)';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Cut out the circle
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CROP_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    // Redraw image inside circle only
    ctx.save();
    ctx.beginPath();
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CROP_RADIUS, 0, Math.PI * 2);
    ctx.clip();
    ctx.translate(CANVAS_SIZE / 2 + offset.x, CANVAS_SIZE / 2 + offset.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    const scale2 = Math.max(
      (CANVAS_SIZE / img.naturalWidth) * 1.2,
      (CANVAS_SIZE / img.naturalHeight) * 1.2
    );
    const w2 = img.naturalWidth * scale2;
    const h2 = img.naturalHeight * scale2;
    ctx.drawImage(img, -w2 / 2, -h2 / 2, w2, h2);
    ctx.restore();

    // Circle border
    ctx.strokeStyle = '#6366F1';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CROP_RADIUS, 0, Math.PI * 2);
    ctx.stroke();

    // Square crop guide
    const sq = CROP_RADIUS * Math.SQRT2;
    ctx.strokeStyle = 'rgba(99,102,241,0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(CANVAS_SIZE / 2 - sq / 2, CANVAS_SIZE / 2 - sq / 2, sq, sq);
    ctx.setLineDash([]);
  }, [rotation, zoom, offset]);

  useEffect(() => {
    imgRef.current.src = imageSrc;
    imgRef.current.onload = drawCanvas;
  }, [imageSrc, drawCanvas]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleMouseDown = (e) => {
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };
  const handleMouseMove = (e) => {
    if (!dragging) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setDragging(false);

  // Touch events
  const handleTouchStart = (e) => {
    const t = e.touches[0];
    setDragging(true);
    setDragStart({ x: t.clientX - offset.x, y: t.clientY - offset.y });
  };
  const handleTouchMove = (e) => {
    if (!dragging) return;
    const t = e.touches[0];
    setOffset({ x: t.clientX - dragStart.x, y: t.clientY - dragStart.y });
  };

  const handleSave = async () => {
    try {
      const canvas = canvasRef.current;
      // Extract circular crop to a separate canvas
      const outCanvas = document.createElement('canvas');
      outCanvas.width = CROP_RADIUS * 2;
      outCanvas.height = CROP_RADIUS * 2;
      const outCtx = outCanvas.getContext('2d');
      if (!outCtx) {
        throw new Error('Failed to get canvas context');
      }
      outCtx.beginPath();
      outCtx.arc(CROP_RADIUS, CROP_RADIUS, CROP_RADIUS, 0, Math.PI * 2);
      outCtx.clip();
      outCtx.drawImage(
        canvas,
        CANVAS_SIZE / 2 - CROP_RADIUS, CANVAS_SIZE / 2 - CROP_RADIUS,
        CROP_RADIUS * 2, CROP_RADIUS * 2,
        0, 0, CROP_RADIUS * 2, CROP_RADIUS * 2
      );
      
      const dataUrl = outCanvas.toDataURL('image/png');
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      onSave(blob);
    } catch (err) {
      console.error('Crop save error:', err);
      toast.error('Image crop failed: ' + err.message);
      if (onCancel) onCancel();
    }
  };

  return (
    <Modal isOpen={true} onClose={onCancel} title="Crop Avatar">
      <div className="space-y-6">
        {/* Canvas */}
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="rounded-full border-2 border-primary/40 shadow-[0_0_20px_rgba(124,58,237,0.2)] cursor-grab active:cursor-grabbing select-none"
            style={{ touchAction: 'none' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
          />
        </div>

        {/* Zoom slider */}
        <div className="space-y-2 px-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-text-secondaryLight dark:text-text-secondaryDark uppercase tracking-wider flex items-center gap-1.5">
              <ZoomIn size={12} className="text-primary" /> Zoom
            </label>
            <span className="text-[10px] font-mono text-primary">{zoom.toFixed(2)}x</span>
          </div>
          <input
            type="range" min="0.5" max="3" step="0.05" value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-full h-1.5 rounded-full cursor-pointer appearance-none transition-all [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent)] hover:[&::-webkit-slider-thumb]:shadow-[0_0_10px_var(--accent-glow)]"
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)' }}
          />
        </div>

        {/* Rotation */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-wider flex-1" style={{ color: 'var(--text-secondary)' }}>Rotate</span>
          <button
            onClick={() => setRotation((r) => r - 90)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-input)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          >
            <RotateCcw size={13} /> 90°
          </button>
          <button
            onClick={() => setRotation(0)}
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-input)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          >
            Reset
          </button>
          <button
            onClick={() => setRotation((r) => r + 90)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-input)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          >
            <RotateCw size={13} /> 90°
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
            onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseOut={e => e.currentTarget.style.background = 'var(--bg-card)'}
          >
            Cancel
          </button>
          <Button onClick={handleSave} className="flex-1">
            <Check size={16} />
            Apply
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Camera Capture ────────────────────────────────────────────────────────────
function CameraCapture({ onCapture, onCancel }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => setReady(true);
        }
      })
      .catch(() => setError('Camera access was denied or not available.'));

    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    onCapture(canvas.toDataURL('image/jpeg', 0.9));
  };

  return (
    <Modal isOpen={true} onClose={onCancel} title="Take Photo">
      <div className="space-y-5">
        {error ? (
          <div className="text-center py-8 text-sm text-danger">{error}</div>
        ) : (
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-square flex items-center justify-center shadow-inner">
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
            {/* Circle overlay guide */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 rounded-full border border-primary shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]" />
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
            onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseOut={e => e.currentTarget.style.background = 'var(--bg-card)'}
          >
            Cancel
          </button>
          <Button onClick={handleCapture} disabled={!ready || !!error} className="flex-1">
            <Camera size={16} />
            Capture
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function AvatarSourcePicker({ onCamera, onFile, onCancel }) {
  return (
    <Modal isOpen={true} onClose={onCancel} title="Update Photo">
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onCamera}
          className="flex flex-col items-center gap-4 p-6 rounded-xl transition-all group"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
          onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
        >
          <div className="p-4 rounded-full transition-transform group-hover:scale-110" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)' }}>
            <Camera size={24} style={{ color: 'var(--accent)' }} />
          </div>
          <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Camera</span>
        </button>
        <button
          onClick={onFile}
          className="flex flex-col items-center gap-4 p-6 rounded-xl transition-all group"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
          onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
        >
          <div className="p-4 rounded-full transition-transform group-hover:scale-110" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)' }}>
            <Upload size={24} style={{ color: 'var(--accent)' }} />
          </div>
          <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Gallery</span>
        </button>
      </div>
    </Modal>
  );
}

// ─── Main ProfileSettings Component ──────────────────────────────────────────
const TABS = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'chats', label: 'Chats', icon: MessageSquare },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'ai', label: 'AI Settings', icon: Bot },
];

export function ProfileSettings() {
  const { user, updateUserAvatar, logout } = useAuthStore();
  const { theme, toggleTheme } = useUiStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully.');
    navigate('/login');
  };

  const [activeTab, setActiveTab] = useState('account');
  const [tabMenuOpen, setTabMenuOpen] = useState(false);
  const tabMenuRef = useRef(null);
  const [username, setUsername] = useState(user?.username || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  
  // Chat Preferences toggles
  const [readReceipts, setReadReceipts] = useState(true);
  const [notifications, setNotifications] = useState(true);

  // AI Settings state
  const [aiEnabled, setAiEnabled] = useState(true);
  const [shareReport, setShareReport] = useState(false);
  const [aiFilters, setAiFilters] = useState({ text: true, documents: true, images: true, videos: false });

  // Avatar flow state
  const [showSourcePicker, setShowSourcePicker] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cropSrc, setCropSrc] = useState(null);
  const fileInputRef = useRef(null);

  // Avatar source picker handlers
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const avatarMenuRef = useRef(null);

  // Close floating menu on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target)) {
        setShowAvatarMenu(false);
      }
      if (tabMenuRef.current && !tabMenuRef.current.contains(e.target)) {
        setTabMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleAvatarClick = () => {
    setShowAvatarMenu(!showAvatarMenu);
  };

  const handleResetAvatar = async () => {
    try {
      setUploading(true);
      const updatedUser = await updateProfile({ avatar: '' }); // or null/default depending on backend
      useAuthStore.setState(state => ({ user: { ...state.user, avatar: updatedUser.avatar } }));
      toast.success('Avatar reset to default');
    } catch (error) {
      console.error(error);
      toast.error('Failed to reset avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleOpenFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file.'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setCropSrc(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCameraCapture = (dataUrl) => {
    setShowCamera(false);
    setCropSrc(dataUrl);
  };

  const handleCropSave = async (croppedFile) => {
    setCropSrc(null);
    setUploading(true);
    try {
      const data = await uploadFile(croppedFile);
      const updatedUser = await updateProfile({ avatar: data.fileUrl });
      updateUserAvatar(updatedUser.avatar);
      toast.success('Avatar updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Avatar upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!username.trim()) { toast.error('Username cannot be empty.'); return; }
    setSaving(true);
    try {
      const updatedUser = await updateProfile({ username: username.trim() });
      updateUserAvatar(updatedUser.avatar); // Not strictly needed but nice
      // Also need to update username in the store!
      useAuthStore.setState((state) => ({ user: { ...state.user, username: updatedUser.username } }));
      toast.success('Profile settings updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwords.current || !passwords.next || !passwords.confirm) { toast.error('Please fill in all password fields.'); return; }
    if (passwords.next !== passwords.confirm) { toast.error('New passwords do not match.'); return; }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setPasswords({ current: '', next: '', confirm: '' });
      toast.success('Password changed successfully!');
    }, 1000);
  };

  const sectionTextStyle = { color: 'var(--text-primary)' };
  const mutedStyle = { color: 'var(--text-muted)' };


  return (
    <>
      {/* Modals */}
      {showPresets && (
        <Modal isOpen={showPresets} onClose={() => setShowPresets(false)} title="Choose Preset">
          <div className="grid grid-cols-4 gap-3 p-2">
            {PRESET_AVATARS.map((av) => (
              <button
                key={av.id}
                onClick={async () => {
                  try {
                    const updatedUser = await updateProfile({ avatar: av.url });
                    useAuthStore.setState((state) => ({ user: { ...state.user, avatar: updatedUser.avatar } }));
                    toast.success(`Avatar set to ${av.label}!`);
                    setShowPresets(false);
                  } catch {
                    toast.error('Failed to set avatar.');
                  }
                }}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${
                  user?.avatar === av.url ? 'border-primary shadow-[0_0_10px_rgba(124,58,237,0.5)]' : 'border-white/10 hover:border-primary/50'
                }`}
                title={av.label}
              >
                <img src={av.url} alt={av.label} className="w-full h-full object-cover bg-gray-100" />
              </button>
            ))}
          </div>
        </Modal>
      )}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onCancel={() => setShowCamera(false)}
        />
      )}
      {cropSrc && (
        <AvatarCropper
          imageSrc={cropSrc}
          onSave={handleCropSave}
          onCancel={() => setCropSrc(null)}
        />
      )}

      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

      <div className="space-y-6 w-full">
        {/* Avatar */}
        <div className="flex flex-col items-center space-y-4 pt-2 relative z-50">
          <div className="relative cursor-pointer group" onClick={handleAvatarClick}>
            <AvatarRing src={user?.avatar} name={user?.username} size="xl" />
            <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {uploading
                ? <RefreshCw className="animate-spin text-white mb-1" size={24} />
                : <Camera className="text-white mb-1" size={24} />
              }
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">Update</span>
            </div>
          </div>

          {/* Floating Menu for Avatar Update */}
          {showAvatarMenu && (
            <div ref={avatarMenuRef} className="absolute top-[110px] z-50 w-56 rounded-2xl shadow-xl animate-scale-up overflow-hidden" style={{ background: 'var(--bg-modal)', border: '1px solid var(--border-primary)' }}>
              <div className="flex flex-col text-left">
                <button onClick={() => { setShowAvatarMenu(false); setShowCamera(true); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors" style={{ color: 'var(--text-primary)' }} onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                  <Camera size={16} /> Take Photo
                </button>
                <button onClick={() => { setShowAvatarMenu(false); handleOpenFile(); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors" style={{ color: 'var(--text-primary)' }} onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                  <Upload size={16} /> Upload Image
                </button>
                <button onClick={() => { setShowAvatarMenu(false); setShowPresets(true); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors" style={{ color: 'var(--text-primary)' }} onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                  <Star size={16} /> Choose Preset
                </button>
                {user?.avatar && (
                  <button onClick={() => { setShowAvatarMenu(false); handleResetAvatar(); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-error transition-colors" onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    <RotateCcw size={16} /> Reset Avatar
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tabs Dropdown */}
        <div className="relative" ref={tabMenuRef} style={{ zIndex: 40 }}>
          <button
            onClick={() => setTabMenuOpen(!tabMenuOpen)}
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold transition-all outline-none"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
          >
            <div className="flex items-center gap-2.5">
              {React.createElement(TABS.find(t => t.id === activeTab)?.icon || User, { size: 16, style: { color: 'var(--accent)' } })}
              {TABS.find(t => t.id === activeTab)?.label}
            </div>
            <ChevronDown size={16} className={`transition-transform duration-300 ${tabMenuOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }} />
          </button>
          
          {tabMenuOpen && (
            <div 
              className="absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in"
              style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-primary)' }}
            >
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => { setActiveTab(id); setTabMenuOpen(false); }}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-bold transition-colors text-left"
                  style={{ color: activeTab === id ? 'var(--accent)' : 'var(--text-primary)' }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} />
                    {label}
                  </div>
                  {activeTab === id && <Check size={16} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tab: Account */}
        {activeTab === 'account' && (
          <div className="space-y-6 animate-fade-in py-2">
            <form onSubmit={handleProfileSave} className="space-y-5">
              <h3 className="text-sm font-display font-bold tracking-wider flex items-center" style={{ color: 'var(--text-primary)' }}>
              <User size={16} className="mr-2" style={{ color: 'var(--accent)' }} />
              Personal Details
            </h3>
              <Input 
                label="Username" 
                icon={User} 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
              />
              <Input 
                label="Email Address" 
                icon={Bot} 
                value={user?.email || ''} 
                disabled 
              />
              <Button type="submit" loading={saving} className="w-full">
                <Save size={16} />
                Save Changes
              </Button>
            </form>

            <div className="pt-4 mt-6" style={{ borderTop: '1px solid var(--border-primary)' }}>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-colors"
                style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                onMouseOver={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; }}
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Tab: Chats */}
        {activeTab === 'chats' && (
          <div className="space-y-5 animate-fade-in py-2">
            <h3 className="text-sm font-display font-bold tracking-wider flex items-center" style={{ color: 'var(--text-primary)' }}>
              <MessageSquare size={16} className="mr-2" style={{ color: 'var(--accent)' }} />
              Chat Preferences
            </h3>

            {/* Read receipts */}
            <div
              className="flex items-center justify-between p-4 rounded-xl transition-all"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
              onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseOut={e => e.currentTarget.style.background = 'var(--bg-card)'}
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl" style={{ background: 'var(--accent-glow)' }}>
                  <Eye size={18} style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Read Receipts</div>
                  <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Show seen status to senders</div>
                </div>
              </div>
              {/* Toggle */}
              <div
                className="relative w-12 h-6 rounded-full cursor-pointer transition-all duration-300 flex-shrink-0"
                style={{
                  background: readReceipts ? 'var(--accent)' : 'var(--bg-input)',
                  boxShadow: readReceipts ? '0 0 10px var(--accent-glow)' : 'none',
                  border: readReceipts ? 'none' : '1px solid var(--border-primary)'
                }}
                onClick={() => setReadReceipts(!readReceipts)}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${readReceipts ? 'translate-x-7' : 'translate-x-1'}`} />
              </div>
            </div>

            {/* Notifications */}
            <div
              className="flex items-center justify-between p-4 rounded-xl transition-all"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
              onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseOut={e => e.currentTarget.style.background = 'var(--bg-card)'}
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl" style={{ background: 'var(--accent-glow)' }}>
                  <Bell size={18} style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Notifications</div>
                  <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Message push alerts</div>
                </div>
              </div>
              {/* Toggle */}
              <div
                className="relative w-12 h-6 rounded-full cursor-pointer transition-all duration-300 flex-shrink-0"
                style={{
                  background: notifications ? 'var(--accent)' : 'var(--bg-input)',
                  boxShadow: notifications ? '0 0 10px var(--accent-glow)' : 'none',
                  border: notifications ? 'none' : '1px solid var(--border-primary)'
                }}
                onClick={() => setNotifications(!notifications)}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${notifications ? 'translate-x-7' : 'translate-x-1'}`} />
              </div>
            </div>
          </div>
        )}

        {/* Tab: Security */}
        {activeTab === 'security' && (
          <div className="space-y-6 animate-fade-in py-2">
            <form onSubmit={handlePasswordChange} className="space-y-5">
              <h3 className="text-sm font-display font-bold tracking-wider flex items-center" style={{ color: 'var(--text-primary)' }}>
              <Lock size={16} className="mr-2" style={{ color: 'var(--accent)' }} />
              Change Password
            </h3>

              <div className="relative">
                <Input label="Current Password" type="password" icon={Lock} value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} />
                <button 
                  type="button" 
                  onClick={() => { handleLogout(); }}
                  className="absolute right-3 top-1 text-[10px] hover:underline"
                  style={{ color: 'var(--accent)' }}
                >
                  Forgot?
                </button>
              </div>
              <Input label="New Password" type="password" icon={Shield} value={passwords.next} onChange={e => setPasswords({...passwords, next: e.target.value})} />
              <Input label="Confirm New Password" type="password" icon={Shield} value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} />

              <button
                type="submit"
                disabled={saving}
                className="w-full relative flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold transition-all"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--accent)', color: 'var(--accent)' }}
                onMouseOver={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = '#fff'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--accent)'; }}
              >
                <Lock size={16} />
                Update Password
              </button>
            </form>


          </div>
        )}

        {/* Tab: AI Scanning */}
        {activeTab === 'ai' && (
          <div className="space-y-5 animate-fade-in py-2">
            <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
              <h3 className="text-sm font-display font-bold tracking-wider flex items-center" style={{ color: 'var(--text-primary)' }}>
                <Bot size={16} className="mr-2" style={{ color: 'var(--accent)' }} />
                AI Security Scanner
              </h3>
              <div 
                className="relative w-12 h-6 rounded-full transition-colors duration-300 outline-none cursor-pointer"
                style={{
                  background: aiEnabled ? 'var(--accent)' : 'var(--bg-input)',
                  boxShadow: aiEnabled ? '0 0 10px var(--accent-glow)' : 'none',
                  border: aiEnabled ? 'none' : '1px solid var(--border-primary)'
                }}
                onClick={() => setAiEnabled(!aiEnabled)}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${aiEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
              </div>
            </div>

            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              When enabled, incoming content will be automatically scanned by our AI threat detection model. Configure which media types to scan below.
            </p>

            <div className={`space-y-4 ${!aiEnabled ? 'opacity-40 grayscale pointer-events-none transition-all' : 'transition-all'}`}>
              
              {/* Share Report Master Toggle */}
              <div
                className="flex items-center justify-between p-4 rounded-xl transition-all"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseOut={e => e.currentTarget.style.background = 'var(--bg-card)'}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="p-2.5 rounded-xl transition-colors"
                    style={{
                      background: shareReport ? 'var(--accent)' : 'var(--bg-input)',
                      color: shareReport ? '#fff' : 'var(--text-secondary)',
                    }}
                  >
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Share AI Report with User</div>
                    <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Send scan results to your chat partner</div>
                  </div>
                </div>
                <div 
                  className="relative w-12 h-6 rounded-full transition-colors duration-300 outline-none cursor-pointer flex-shrink-0"
                  style={{
                    background: shareReport ? 'var(--accent)' : 'var(--bg-input)',
                    boxShadow: shareReport ? '0 0 10px var(--accent-glow)' : 'none',
                    border: shareReport ? 'none' : '1px solid var(--border-primary)'
                  }}
                  onClick={() => setShareReport(!shareReport)}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${shareReport ? 'translate-x-7' : 'translate-x-1'}`} />
                </div>
              </div>

              {/* Sub-options for Sharing (Only visible if sharing is enabled) */}
              {shareReport && (
                <div className="pl-6 space-y-3 relative border-l-2 ml-4 animate-fade-in" style={{ borderColor: 'var(--border-primary)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Select Types to Share</p>
                  {[
                    { key: 'text', label: 'Text Messages', icon: FileText, desc: 'Share reports for phishing & social engineering' },
                    { key: 'documents', label: 'Documents', icon: File, desc: 'Share reports for malicious payloads' },
                    { key: 'images', label: 'Images', icon: ImageIcon, desc: 'Share reports for steganography' },
                    { key: 'videos', label: 'Videos', icon: Video, desc: 'Share reports for video threats' }
                  ].map(({ key, label, icon: Icon, desc }) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-3 rounded-xl transition-all"
                      style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)' }}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={14} style={{ color: aiFilters[key] ? 'var(--accent)' : 'var(--text-muted)' }} />
                        <div>
                          <div className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{label}</div>
                          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{desc}</div>
                        </div>
                      </div>
                      <div 
                        className="relative w-10 h-5 rounded-full transition-colors duration-300 outline-none cursor-pointer flex-shrink-0"
                        style={{
                          background: aiFilters[key] ? 'var(--accent)' : 'var(--bg-card)',
                          border: aiFilters[key] ? 'none' : '1px solid var(--border-primary)'
                        }}
                        onClick={() => setAiFilters({ ...aiFilters, [key]: !aiFilters[key] })}
                      >
                        <span className={`absolute top-[2px] w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${aiFilters[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ProfileSettings;
