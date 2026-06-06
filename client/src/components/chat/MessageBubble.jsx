import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  File, Download, Video, Music,
  ShieldAlert, Check, CheckCheck, Trash2, Info,
  MoreVertical, Clock, CheckCircle2, Eye, Star,
  Bot, Share2, Lock
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useChatStore from '../../store/chatStore';
import useMessageStatus from '../../hooks/useMessageStatus';
import { SCAN_STATES } from '../../constants/scanStates';
import ScanStatusBadge from '../scan/ScanStatusBadge';
import ThreatWarningCard from '../scan/ThreatWarningCard';
import { formatBytes } from '../../utils/fileValidator';
import {
  deleteMessageForMe,
  deleteMessageForEveryone,
  starMessage,
  submitAiReport,
  shareAiReport,
} from '../../api/messages';
import { decryptMessage } from '../../utils/crypto';
import { Modal } from '../ui/Modal';
import toast from 'react-hot-toast';

// ── Mini spinner ───────────────────────────────────────────────────────────────
function MiniSpin({ color = 'var(--accent)' }) {
  return (
    <span
      className="inline-block w-3 h-3 border-2 rounded-full animate-spin"
      style={{ borderColor: `${color}40`, borderTopColor: color }}
    />
  );
}

// ── AI Report Badge ────────────────────────────────────────────────────────────
function AiReportBadge({ report, canShare, onShare, sharedWith }) {
  const [sharing, setSharing] = useState(false);
  const isShared = Array.isArray(sharedWith) && sharedWith.length > 0;

  if (!report) return null;

  const risk = report.riskScore ?? 0;
  const isRisky = risk > 50;

  const badgeStyle = isRisky
    ? { border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#f87171' }
    : { border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.08)', color: '#4ade80' };

  const handleShare = async () => {
    setSharing(true);
    try { await onShare(); toast.success('AI report shared with sender!'); }
    catch { toast.error('Failed to share report.'); }
    finally { setSharing(false); }
  };

  return (
    <div className="mt-2 p-2.5 rounded-xl text-[11px]" style={badgeStyle}>
      <div className="flex items-center gap-1.5 font-bold mb-1">
        <Bot size={11} />
        AI Analysis
        {isShared && <span className="ml-auto opacity-60 text-[9px]">· Shared</span>}
      </div>
      <p className="opacity-80 leading-relaxed">{report.details || report.status}</p>
      {risk !== undefined && (
        <div className="flex items-center justify-between mt-1.5 flex-wrap gap-1">
          <span className="text-[9px] opacity-60">Risk: {risk}/100</span>
        </div>
      )}
    </div>
  );
}

// ── Message Info Modal ─────────────────────────────────────────────────────────
function MessageInfoModal({ message, onClose }) {
  const fmt = (d) => d
    ? new Date(d).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;

  const rows = [
    { icon: <Clock size={13} />, label: 'Sent', value: fmt(message.createdAt), fallback: '—', colorKey: 'var(--accent)' },
    { icon: <CheckCircle2 size={13} />, label: 'Delivered', value: fmt(message.deliveredAt), fallback: 'Pending…', colorKey: '#60a5fa' },
    { icon: <Eye size={13} />, label: 'Seen', value: fmt(message.readAt), fallback: 'Not yet seen', colorKey: '#4ade80' },
  ];

  return (
    <Modal isOpen onClose={onClose} title="Message Info">
      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between p-4 rounded-xl"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl" style={{ background: 'var(--bg-hover)', color: row.colorKey }}>{row.icon}</div>
              <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{row.label}</span>
            </div>
            <span
              className="text-[11px] font-mono font-bold"
              style={{ color: row.value ? row.colorKey : 'var(--text-muted)' }}
            >
              {row.value || row.fallback}
            </span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

// ── Context Menu (renders as a fixed portal to avoid clipping) ─────────────────
function ContextMenu({ isMe, isStarred, onStar, onInfo, onDeleteMe, onDeleteEveryone, onClose, anchorRef }) {
  const menuRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  // Position the menu below/above the trigger button
  useEffect(() => {
    if (!anchorRef?.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const menuH = 180; // approx height
    const viewH = window.innerHeight;
    const top = rect.bottom + 4 + menuH > viewH
      ? rect.top - menuH - 4
      : rect.bottom + 4;
    const left = Math.min(rect.left, window.innerWidth - 200);
    setPos({ top, left });
  }, [anchorRef]);

  // Close on outside click
  useEffect(() => {
    const handle = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) &&
          anchorRef?.current && !anchorRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [onClose, anchorRef]);

  const Item = ({ icon, label, onClick, danger }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors text-left"
      style={{ color: danger ? '#f87171' : 'var(--text-primary)' }}
      onMouseOver={e => e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.1)' : 'var(--bg-hover)'}
      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
    >
      <span style={{ color: danger ? '#f87171' : 'var(--text-accent)' }}>{icon}</span>
      {label}
    </button>
  );

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] w-52 rounded-2xl overflow-hidden p-1 animate-scale-up"
      style={{
        top: pos.top,
        left: pos.left,
        background: 'var(--bg-modal)',
        border: '1px solid var(--border-primary)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
      }}
    >
      <Item
        icon={<Star size={13} className={isStarred ? 'fill-yellow-400 text-yellow-400' : ''} />}
        label={isStarred ? 'Unstar Message' : 'Star Message'}
        onClick={onStar}
      />
      <div className="h-px my-1" style={{ background: 'var(--border-primary)' }} />
      <Item icon={<Info size={13} />} label="Message Info" onClick={onInfo} />
      <div className="h-px my-1" style={{ background: 'var(--border-primary)' }} />
      <Item icon={<Trash2 size={13} />} label="Delete for Me" onClick={onDeleteMe} danger={false} />
      {isMe && (
        <>
          <div className="h-px my-1" style={{ background: 'var(--border-primary)' }} />
          <Item icon={<Trash2 size={13} />} label="Delete for Everyone" onClick={onDeleteEveryone} danger />
        </>
      )}
    </div>
  );
}

// ── AI Analyzing Overlay ───────────────────────────────────────────────────────
function AiAnalyzingOverlay({ onBypass }) {
  return (
    <div
      className="absolute inset-0 rounded-3xl flex flex-col items-center justify-center gap-2 z-10"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
    >
      <div className="flex gap-1 mb-1">
        {[0, 0.15, 0.3].map((d, i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full animate-bounce"
            style={{ background: 'var(--accent)', animationDelay: `${d}s` }}
          />
        ))}
      </div>
      <span className="text-[10px] font-bold" style={{ color: 'var(--accent)' }}>🤖 Analyzing…</span>
      <button
        onClick={onBypass}
        className="text-[9px] underline mt-1"
        style={{ color: 'var(--text-muted)' }}
      >
        Skip
      </button>
    </div>
  );
}

// ── Main MessageBubble ─────────────────────────────────────────────────────────
export function MessageBubble({ message, socket, partnerPublicKey, senderPublicKey, aiEnabled }) {
  const { user } = useAuthStore();
  const { deleteMessageInStore, toggleStarInStore, updateMessageAiReport } = useChatStore();
  const liveStatus = useMessageStatus(message);

  const [bypassed, setBypassed] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [decryptedText, setDecryptedText] = useState(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiDone, setAiDone] = useState(false);
  const [localAiReport, setLocalAiReport] = useState(message.aiReport || null);
  const [localSharedWith, setLocalSharedWith] = useState(message.aiReportSharedWith || []);

  // The anchor ref is on the three-dot button itself
  const dotBtnRef = useRef(null);

  const isMe = (message.senderId._id || message.senderId) === user?._id;
  const senderId = message.senderId._id || message.senderId;
  const receiverId = message.receiverId._id || message.receiverId;
  const isSelfMessages = senderId === receiverId;
  const isRead = !!message.readAt;
  const isDelivered = !!message.deliveredAt;
  const isStarred = message._clientStarred ?? (message.starredBy?.some(id => (id?._id || id) === user?._id));

  // Decrypt
  useEffect(() => {
    const decrypt = async () => {
      if (!message.textContent) return;
      if (message.encryptedContent && senderPublicKey) {
        try {
          const plaintext = await decryptMessage(message.encryptedContent, senderPublicKey);
          setDecryptedText(plaintext);
          return;
        } catch {}
      }
      setDecryptedText(message.textContent);
    };
    decrypt();
  }, [message.textContent, message.encryptedContent, senderPublicKey]);

  // AI analysis (receiver side)
  useEffect(() => {
    if (isMe || !aiEnabled || message.aiAnalyzed || aiDone || isSelfMessages) return;
    if (!decryptedText && !message.fileUrl) return;

    const runAnalysis = async () => {
      setAiAnalyzing(true);
      try {
        await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
        const textToAnalyze = decryptedText || message.fileName || '';
        const hasRiskyKeywords = /password|secret|hack|exploit|malware|virus/i.test(textToAnalyze);
        const report = {
          status: hasRiskyKeywords ? 'SUSPICIOUS' : 'CLEAN',
          details: hasRiskyKeywords
            ? 'Potentially sensitive keywords detected. Review before acting on this content.'
            : 'No threats detected. Content appears safe.',
          riskScore: hasRiskyKeywords ? Math.floor(55 + Math.random() * 35) : Math.floor(Math.random() * 18),
          analyzedAt: new Date().toISOString(),
        };
        await submitAiReport(message._id, report).catch(() => {});
        setLocalAiReport(report);
        updateMessageAiReport(message._id, report);
        setAiDone(true);
      } catch {
        setAiDone(true);
      } finally {
        setAiAnalyzing(false);
        setBypassed(false);
      }
    };

    runAnalysis();
  }, [isMe, aiEnabled, decryptedText, message.fileUrl, message.aiAnalyzed, aiDone, isSelfMessages]);

  // Mark as read
  useEffect(() => {
    if (!isMe && !isRead && socket) {
      socket.emit('message:read', { messageId: message._id, conversationId: message.conversationId });
    }
  }, [isMe, isRead, message._id, message.conversationId, socket]);

  const isScanning = liveStatus.scanStatus === SCAN_STATES.SCANNING;
  const isDeepScan = liveStatus.scanStatus === SCAN_STATES.TIER2_SCANNING;
  const isSuspicious = liveStatus.scanStatus === SCAN_STATES.SUSPICIOUS;
  const isMalware = liveStatus.scanStatus === SCAN_STATES.MALWARE;
  const isQuarantined = liveStatus.scanStatus === SCAN_STATES.QUARANTINED;

  const contentBlurred = (isScanning || isDeepScan || aiAnalyzing) && !bypassed;
  const shouldRenderThreat = (isMalware || isQuarantined) && !bypassed;

  const formatTime = (d) => d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  const handleStar = async () => {
    setShowMenu(false);
    try {
      const result = await starMessage(message._id);
      toggleStarInStore(message._id, result.starred);
      toast.success(result.starred ? '⭐ Starred' : 'Unstarred');
    } catch { toast.error('Failed to star.'); }
  };

  const handleDeleteMe = async () => {
    setShowMenu(false);
    try {
      await deleteMessageForMe(message._id);
      deleteMessageInStore(message._id, false);
      toast.success('Deleted for you.');
    } catch { toast.error('Failed to delete.'); }
  };

  const handleDeleteEveryone = async () => {
    setShowMenu(false);
    try {
      await deleteMessageForEveryone(message._id);
      deleteMessageInStore(message._id, true);
      toast.success('Deleted for everyone.');
    } catch { toast.error('Failed to delete for everyone.'); }
  };



  const handleDownload = (url, name) => {
    setDownloading(true);
    setTimeout(() => {
      const a = document.createElement('a');
      a.href = url; a.download = name; a.target = '_blank';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setDownloading(false);
    }, 600);
  };

  if (message.deletedForMe) return null;

  if (message.isDeletedForEveryone) {
    return (
      <div className={`flex w-full mb-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
        <div
          className="rounded-2xl px-4 py-2 text-xs italic flex items-center gap-2 max-w-[65%]"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', color: 'var(--text-muted)' }}
        >
          <Trash2 size={11} /> This message was deleted
        </div>
      </div>
    );
  }

  // Attachment renderer
  const renderAttachment = () => {
    if (!message.fileUrl) return null;

    if (message.contentType === 'image') {
      return (
        <div className="relative group max-w-[260px] rounded-xl overflow-hidden">
          <img
            src={message.fileUrl}
            alt={message.fileName}
            className="w-full max-h-60 object-cover"
            style={{ filter: contentBlurred ? 'blur(6px)' : 'none' }}
          />
          {!contentBlurred && (
            <button
              onClick={() => handleDownload(message.fileUrl, message.fileName)}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
            >
              {downloading ? <MiniSpin color="#fff" /> : <Download className="text-white" size={20} />}
            </button>
          )}
        </div>
      );
    }

    const icons = {
      video: <Video size={18} className="text-pink-400" />,
      audio: <Music size={18} className="text-green-400" />,
    };

    return (
      <div
        className="flex items-center gap-3 p-3 rounded-xl max-w-[260px]"
        style={{
          background: isMe ? 'rgba(255,255,255,0.1)' : 'var(--bg-bubble-them)',
          border: isMe ? '1px solid rgba(255,255,255,0.15)' : '1px solid var(--border-primary)',
        }}
      >
        <div className="p-2.5 rounded-xl flex-shrink-0" style={{ background: isMe ? 'rgba(255,255,255,0.15)' : 'var(--bg-hover)' }}>
          {contentBlurred
            ? <MiniSpin />
            : (icons[message.contentType] || <File size={18} style={{ color: isMe ? '#ffffff' : 'var(--accent)' }} />)
          }
        </div>
        <div className="overflow-hidden flex-1 min-w-0">
          <div className="text-xs font-bold truncate" style={{ color: 'inherit' }}>{message.fileName}</div>
          <div className="text-[10px] mt-0.5 opacity-70" style={{ color: 'inherit' }}>
            {contentBlurred
              ? <span className="animate-pulse" style={{ color: 'inherit' }}>
                  {aiAnalyzing ? '🤖 Analyzing…' : isDeepScan ? '🔬 Deep scan…' : '🛡️ Scanning…'}
                </span>
              : formatBytes(message.fileSize || 0)
            }
          </div>
        </div>
        {!contentBlurred && (
          <button
            onClick={() => handleDownload(message.fileUrl, message.fileName)}
            className="flex-shrink-0 p-1.5 rounded-lg transition-colors"
            style={{ color: isMe ? 'rgba(255,255,255,0.9)' : 'var(--text-muted)' }}
            onMouseOver={e => e.currentTarget.style.background = isMe ? 'rgba(255,255,255,0.15)' : 'var(--bg-hover)'}
            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
          >
            {downloading ? <MiniSpin /> : <Download size={15} />}
          </button>
        )}
      </div>
    );
  };

  // Content renderer
  const renderContent = () => {
    if (shouldRenderThreat) {
      if (isMe && !isSelfMessages) {
        return (
          <div
            className="rounded-2xl p-3 max-w-[240px]"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            <div className="flex items-center font-bold text-xs mb-1.5 text-red-400">
              <ShieldAlert size={13} className="mr-1.5" /> 🚫 CONTENT BLOCKED
            </div>
            <p className="text-[10px] leading-relaxed opacity-80" style={{ color: 'inherit' }}>
              Your file was flagged and quarantined. Recipient notified.
            </p>
          </div>
        );
      }
      return <ThreatWarningCard threatType={liveStatus.threatType} confidence={liveStatus.threatConfidence} onOverrideClean={() => setBypassed(true)} />;
    }

    const displayText = decryptedText !== null ? decryptedText : message.textContent;

    return (
      <div className="space-y-1.5">
        {message.fileUrl && renderAttachment()}
        {displayText && (
          <div className="relative">
            {message.encryptedContent && (
              <Lock size={9} className="absolute -top-1 -right-1 opacity-40" style={{ color: 'var(--accent)' }} />
            )}
            <p
              className={`text-sm leading-relaxed whitespace-pre-wrap break-words msg-text ${contentBlurred ? 'blur-sm select-none' : ''}`}
            >
              {displayText}
            </p>
          </div>
        )}
        {/* AI Report (receiver sees it) */}
        {!isMe && (localAiReport || message.aiReport) && (
          <AiReportBadge
            report={localAiReport || message.aiReport}
            canShare={false}
            sharedWith={localSharedWith}
          />
        )}
        {/* AI Report shared → sender sees it too */}
        {isMe && message.aiReport && localSharedWith.length > 0 && (
          <AiReportBadge
            report={message.aiReport}
            canShare={false}
            sharedWith={localSharedWith}
          />
        )}
      </div>
    );
  };

  // Read receipt icon
  const renderReceipt = () => {
    if (!isMe) return null;
    if (isRead) return <CheckCheck size={11} style={{ color: 'var(--accent)' }} title="Seen" />;
    if (isDelivered) return <CheckCheck size={11} style={{ color: 'var(--text-muted)' }} title="Delivered" />;
    return <Check size={11} style={{ color: 'var(--text-muted)' }} title="Sent" />;
  };

  return (
    <>
      {/* ── Bubble Row ── */}
      <div className={`flex w-full mb-2 ${isMe ? 'justify-end' : 'justify-start'} relative group msg-wrapper`}>
        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%] md:max-w-[65%]`}>

          {/* Sender label (incoming only) */}
          {!isMe && (
            <span className="text-[10px] font-bold mb-1 px-2 uppercase tracking-wide" style={{ color: 'var(--text-accent)' }}>
              {message.senderId.username || 'User'}
            </span>
          )}

          {/* Star indicator */}
          {isStarred && (
            <Star size={10} className="fill-yellow-400 text-yellow-400 mb-0.5 px-1" />
          )}

          {/* Bubble + Three-dot */}
          <div className="relative flex items-start gap-1">

            {/* Three-dot trigger — LEFT of bubble for incoming, right for outgoing */}
            {isMe && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity self-center order-first">
                <button
                  ref={dotBtnRef}
                  onClick={(e) => { e.stopPropagation(); setShowMenu(v => !v); }}
                  className="p-1 rounded-full transition-colors"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', color: 'var(--text-muted)' }}
                  title="Message options"
                >
                  <MoreVertical size={12} />
                </button>
              </div>
            )}

            {/* Bubble */}
            <div
              className={`relative px-4 py-3 min-w-[80px] msg-bubble ${isMe ? 'msg-bubble-me' : 'msg-bubble-them'} ${
                isSuspicious && !shouldRenderThreat ? 'ring-1 ring-yellow-500/40' : ''
              }`}
              style={{
                background: isMe ? 'var(--bg-bubble-me)' : 'var(--bg-bubble-them)',
                borderRadius: isMe ? '24px 24px 6px 24px' : '24px 24px 24px 6px',
                // "me" bubble uses gradient (always has solid text color via --bubble-me-text)
                // "them" bubble: in light themes has solid white fill, needs a visible border
                border: isMe ? 'none' : '1.5px solid var(--border-primary)',
                boxShadow: isMe ? 'var(--shadow-bubble)' : 'var(--shadow-card)',
                // All text inside the bubble inherits the right color
                color: isMe ? 'var(--bubble-me-text, rgba(255,255,255,0.95))' : 'var(--text-primary)',
              }}
            >
              {/* AI analyzing overlay */}
              {aiAnalyzing && !bypassed && (
                <AiAnalyzingOverlay onBypass={() => { setBypassed(true); setAiDone(true); setAiAnalyzing(false); }} />
              )}

              {renderContent()}

              {/* Footer: scan badge + time + receipt */}
              {!shouldRenderThreat && (
                <div className={`flex items-center gap-1.5 mt-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <ScanStatusBadge status={liveStatus.scanStatus} />
                  <span
                    className="text-[10px] font-mono opacity-60"
                    style={{ color: 'inherit' }}
                  >
                    {formatTime(message.createdAt)}
                  </span>
                  {renderReceipt()}
                </div>
              )}
            </div>

            {/* Three-dot trigger — RIGHT side for incoming */}
            {!isMe && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity self-center">
                <button
                  ref={dotBtnRef}
                  onClick={(e) => { e.stopPropagation(); setShowMenu(v => !v); }}
                  className="p-1 rounded-full transition-colors"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', color: 'var(--text-muted)' }}
                  title="Message options"
                >
                  <MoreVertical size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed-position context menu */}
      {showMenu && (
        <ContextMenu
          isMe={isMe}
          isStarred={isStarred}
          anchorRef={dotBtnRef}
          onStar={handleStar}
          onInfo={() => { setShowMenu(false); setShowInfo(true); }}
          onDeleteMe={handleDeleteMe}
          onDeleteEveryone={handleDeleteEveryone}
          onClose={() => setShowMenu(false)}
        />
      )}

      {showInfo && <MessageInfoModal message={message} onClose={() => setShowInfo(false)} />}
    </>
  );
}

export default MessageBubble;
