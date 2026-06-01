import React, { useState } from 'react';
import { File, Download, Image as ImageIcon, Video, Music, ShieldAlert, Check, CheckCheck } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useMessageStatus from '../../hooks/useMessageStatus';
import { SCAN_STATES } from '../../constants/scanStates';
import ScanStatusBadge from '../scan/ScanStatusBadge';
import ThreatWarningCard from '../scan/ThreatWarningCard';
import { formatBytes } from '../../utils/fileValidator';

export function MessageBubble({ message, socket }) {
  const { user } = useAuthStore();
  const liveStatus = useMessageStatus(message);
  const [bypassed, setBypassed] = useState(false);

  const isMe = message.senderId._id === user?._id || message.senderId === user?._id;
  const senderId = message.senderId._id || message.senderId;
  const receiverId = message.receiverId._id || message.receiverId;
  const isSelfMessages = senderId === receiverId;
  
  // Show restricted generic warning to sender, unless self-messaging
  const isRestrictedSenderView = isMe && !isSelfMessages;

  const isRead = !!message.readAt;

  // Mark message as read via socket when visible to receiver
  React.useEffect(() => {
    if (!isMe && !isRead && socket) {
      socket.emit('message:read', {
        messageId: message._id,
        conversationId: message.conversationId
      });
    }
  }, [isMe, isRead, message._id, message.conversationId, socket]);

  // Determine rendering conditions
  const isScanning = liveStatus.scanStatus === SCAN_STATES.SCANNING;
  const isDeepScan = liveStatus.scanStatus === SCAN_STATES.TIER2_SCANNING;
  const isSuspicious = liveStatus.scanStatus === SCAN_STATES.SUSPICIOUS;
  const isMalware = liveStatus.scanStatus === SCAN_STATES.MALWARE;
  const isQuarantined = liveStatus.scanStatus === SCAN_STATES.QUARANTINED;

  const contentBlurred = (isScanning || isDeepScan) && !bypassed;
  const shouldRenderThreat = (isMalware || isQuarantined) && !bypassed;

  // Format time (HH:MM)
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleBypass = () => {
    setBypassed(true);
  };

  // Render file attachment
  const renderAttachment = () => {
    if (!message.fileUrl) return null;

    const extIndex = message.fileName?.lastIndexOf('.') || -1;
    const extension = extIndex !== -1 ? message.fileName.substring(extIndex).toLowerCase() : '';

    if (message.contentType === 'image') {
      return (
        <div className="relative group max-w-xs rounded-xl overflow-hidden border border-border-dark/40 dark:border-border-dark/40 light:border-border-light/40">
          <img 
            src={message.fileUrl} 
            alt={message.fileName} 
            className="w-full max-h-60 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <a
            href={message.fileUrl}
            download={message.fileName}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200"
          >
            <Download className="text-white" size={24} />
          </a>
        </div>
      );
    }

    const getFileIcon = () => {
      if (message.contentType === 'video') return <Video className="text-info" size={20} />;
      if (message.contentType === 'audio') return <Music className="text-success" size={20} />;
      return <File className="text-primary" size={20} />;
    };

    return (
      <div className="flex items-center justify-between p-2.5 bg-surface-dark2 border border-border-dark/60 rounded-xl max-w-xs text-left dark:bg-surface-dark2 dark:border-border-dark/60 light:bg-surface-light2 light:border-border-light/60">
        <div className="flex items-center space-x-2.5 overflow-hidden">
          <div className="p-2 bg-surface-dark rounded-lg dark:bg-surface-dark light:bg-surface-light">
            {getFileIcon()}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold text-text-primaryDark truncate w-32 dark:text-text-primaryDark light:text-text-primaryLight">
              {message.fileName}
            </div>
            <div className="text-[10px] text-text-secondaryDark">
              {formatBytes(message.fileSize || 0)}
            </div>
          </div>
        </div>
        <a
          href={message.fileUrl}
          download={message.fileName}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg hover:bg-surface-dark text-text-secondaryDark hover:text-primary dark:hover:bg-surface-dark light:hover:bg-surface-light transition-colors outline-none ml-2"
        >
          <Download size={14} />
        </a>
      </div>
    );
  };

  // Content render block
  const renderMessageContent = () => {
    if (shouldRenderThreat) {
      if (isRestrictedSenderView) {
        return (
          <div className="w-full bg-danger/10 border border-danger/30 rounded-2xl p-4 max-w-sm text-left">
            <div className="flex items-center text-danger font-bold text-sm mb-2 uppercase tracking-wide">
              <ShieldAlert size={18} className="mr-2" />
              🚫 CONTENT BLOCKED
            </div>
            <p className="text-xs text-text-secondaryDark leading-relaxed dark:text-text-secondaryDark light:text-text-secondaryLight">
              The file you sent has been flagged as potentially harmful by our security models and quarantined.
            </p>
            <div className="mt-2 text-[10px] text-text-mutedDark italic">
              Recipient has been notified of the detailed threat report.
            </div>
          </div>
        );
      }

      return (
        <ThreatWarningCard 
          threatType={liveStatus.threatType}
          confidence={liveStatus.threatConfidence}
          onOverrideClean={handleBypass}
        />
      );
    }

    return (
      <div className="space-y-2">
        {/* Attachment */}
        {message.fileUrl && renderAttachment()}
        
        {/* Text */}
        {message.textContent && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.textContent}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className={`flex w-full mb-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex flex-col space-y-1 max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
        
        {/* Sender Name/Hex Header */}
        {!isMe && (
          <span className="text-[10px] font-bold text-text-secondaryDark tracking-wide px-1">
            {message.senderId.username || 'User'}
          </span>
        )}

        {/* Bubble */}
        <div 
          className={`rounded-2xl px-4 py-2.5 relative transition-all duration-300 ${
            shouldRenderThreat 
              ? 'p-0 bg-transparent border-transparent' 
              : isMe 
                ? 'bg-primary text-white' 
                : 'bg-surface-dark2 text-text-primaryDark dark:bg-surface-dark2 dark:text-text-primaryDark light:bg-surface-light2 light:text-text-primaryLight border border-border-dark dark:border-border-dark light:border-border-light'
          } ${
            isSuspicious && !shouldRenderThreat 
              ? 'border-warning shadow-md shadow-warning/5 border-2 animate-pulse' 
              : ''
          }`}
          style={{
            filter: contentBlurred ? 'blur(4px)' : 'none',
            pointerEvents: contentBlurred ? 'none' : 'auto',
            userSelect: contentBlurred ? 'none' : 'text'
          }}
        >
          {renderMessageContent()}
        </div>

        {/* Status + Metadata Row */}
        {!shouldRenderThreat && (
          <div className="flex items-center space-x-2 px-1 text-[9px] text-text-secondaryDark">
            {/* Scan Badge */}
            <ScanStatusBadge status={liveStatus.scanStatus} />

            {/* Time */}
            <span>{formatTime(message.createdAt)}</span>

            {/* Read receipt tick */}
            {isMe && (
              <span>
                {isRead ? (
                  <CheckCheck size={12} className="text-primary" />
                ) : (
                  <Check size={12} className="text-text-mutedDark" />
                )}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;
