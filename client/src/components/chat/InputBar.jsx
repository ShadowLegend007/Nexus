import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Send, ShieldAlert, Loader2, Camera, Mic } from 'lucide-react';
import useFileUpload from '../../hooks/useFileUpload';
import FilePreview from './FilePreview';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';
import { MediaCaptureModal } from './MediaCaptureModal';
import { AudioRecorderModal } from './AudioRecorderModal';
import { MediaEditorModal } from './MediaEditorModal';

export function InputBar({ conversationId, receiverHexId, onSendMessage, socket }) {
  const [text, setText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [typing, setTyping] = useState(false);
  const [showMediaCapture, setShowMediaCapture] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [showMediaEditor, setShowMediaEditor] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { upload, uploading, progress, error, reset: resetUpload } = useFileUpload();

  // Reset file selector state when conversation changes
  useEffect(() => {
    setSelectedFile(null);
    resetUpload();
    setText('');
    setShowMediaCapture(false);
    setShowAudioRecorder(false);
    setShowMediaEditor(false);
  }, [conversationId]);

  // Handle typing socket notifications
  const handleTextChange = (e) => {
    setText(e.target.value);

    if (!socket || !conversationId || !receiverHexId) return;

    if (!typing) {
      setTyping(true);
      socket.emit('typing:start', { conversationId, receiverHexId });
    }

    // Debounce typing indicator stop event
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
      socket.emit('typing:stop', { conversationId, receiverHexId });
    }, 2000);
  };

  const handleMediaCapture = (file) => {
    setSelectedFile(file);
    setShowMediaCapture(false);
    setShowAudioRecorder(false);
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      setShowMediaEditor(true);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    resetUpload();
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      setShowMediaEditor(true);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    resetUpload();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!text.trim() && !selectedFile) return;

    let fileUrl = null;
    let fileName = null;
    let fileSize = null;
    let contentType = 'text';

    setTyping(false);
    if (socket && conversationId && receiverHexId) {
      socket.emit('typing:stop', { conversationId, receiverHexId });
    }

    if (selectedFile) {
      const uploadResult = await upload(selectedFile);
      if (!uploadResult.success) {
        toast.error(uploadResult.error || 'Failed to upload attachment file.');
        return;
      }
      
      fileUrl = uploadResult.data.fileUrl;
      fileName = uploadResult.data.fileName;
      fileSize = uploadResult.data.fileSize;
      contentType = uploadResult.data.contentType;
    }

    try {
      await onSendMessage({
        conversationId,
        receiverHexId,
        contentType,
        textContent: text.trim() || null,
        fileUrl,
        fileName,
        fileSize,
      });

      // Clear composition
      setText('');
      setSelectedFile(null);
      resetUpload();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      toast.error('Failed to send message.');
    }
  };

  const handleEditorSend = async (file, caption) => {
    setShowMediaEditor(false);
    setText(caption);
    // Trigger submit right after setting text (we need to pass text explicitly since state might not update immediately)
    // Actually, we can just call the submit logic directly here to be safe.
    let fileUrl = null;
    let fileName = null;
    let fileSize = null;
    let contentType = 'text';

    setTyping(false);
    if (socket && conversationId && receiverHexId) {
      socket.emit('typing:stop', { conversationId, receiverHexId });
    }

    if (file) {
      const uploadResult = await upload(file);
      if (!uploadResult.success) {
        toast.error(uploadResult.error || 'Failed to upload attachment file.');
        return;
      }
      
      fileUrl = uploadResult.data.fileUrl;
      fileName = uploadResult.data.fileName;
      fileSize = uploadResult.data.fileSize;
      contentType = uploadResult.data.contentType;
    }

    try {
      await onSendMessage({
        conversationId,
        receiverHexId,
        contentType,
        textContent: caption.trim() || null,
        fileUrl,
        fileName,
        fileSize,
      });

      // Clear composition
      setText('');
      setSelectedFile(null);
      resetUpload();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      toast.error('Failed to send message.');
    }
  };

  return (
    <>
      {showMediaCapture && (
        <MediaCaptureModal 
          onCapture={handleMediaCapture} 
          onCancel={() => setShowMediaCapture(false)} 
        />
      )}
      {showAudioRecorder && (
        <AudioRecorderModal 
          onCapture={handleMediaCapture} 
          onCancel={() => setShowAudioRecorder(false)} 
        />
      )}
      {showMediaEditor && selectedFile && (
        <MediaEditorModal
          file={selectedFile}
          onSend={handleEditorSend}
          onCancel={() => {
            setShowMediaEditor(false);
            setSelectedFile(null);
            resetUpload();
            if (fileInputRef.current) fileInputRef.current.value = '';
          }}
        />
      )}


      <div
        className="p-4 space-y-3 relative z-10 flex-shrink-0"
        style={{
          background: 'var(--bg-panel)',
          borderTop: '1px solid var(--border-primary)',
        }}
      >
        {/* File Composition Preview Card */}
        {selectedFile && (
          <div
            className="flex flex-col space-y-2 p-2 rounded-2xl transition-all"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
            }}
          >
            <FilePreview file={selectedFile} onRemove={handleRemoveFile} />
            
            {/* Progress Bar Loader */}
            {uploading && (
              <div
                className="w-full h-1.5 rounded-full overflow-hidden mt-2"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)' }}
              >
                <div 
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%`, background: 'var(--accent)', boxShadow: '0 0 10px var(--accent-glow)' }}
                />
                <span
                  className="text-[10px] block mt-1 text-left font-mono px-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Uploading security payload... {progress}%
                </span>
              </div>
            )}
          </div>
        )}

        {/* Input composition row */}
        <form onSubmit={handleSubmit} className="flex items-center space-x-2 sm:space-x-3">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              disabled={uploading}
              className="p-2 sm:p-3 rounded-xl transition-all outline-none group"
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-input)',
                color: 'var(--text-secondary)',
              }}
              onMouseOver={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--border-active)'; }}
              onMouseOut={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-input)'; }}
            >
              <Paperclip size={20} className="group-hover:scale-110 transition-transform" />
            </button>
            <button
              type="button"
              onClick={() => setShowMediaCapture(true)}
              disabled={uploading}
              className="p-2 sm:p-3 rounded-xl transition-all outline-none group flex"
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-input)',
                color: 'var(--text-secondary)',
              }}
              onMouseOver={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--border-active)'; }}
              onMouseOut={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-input)'; }}
            >
              <Camera size={20} className="group-hover:scale-110 transition-transform" />
            </button>
            <button
              type="button"
              onClick={() => setShowAudioRecorder(true)}
              disabled={uploading}
              className="p-2 sm:p-3 rounded-xl transition-all outline-none group flex"
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-input)',
                color: 'var(--text-secondary)',
              }}
              onMouseOver={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--border-active)'; }}
              onMouseOut={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-input)'; }}
            >
              <Mic size={20} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />

          <input
            type="text"
            placeholder="Type a secure message..."
            value={text}
            onChange={handleTextChange}
            disabled={uploading}
            className="flex-1 rounded-xl px-3 sm:px-4 py-2 sm:py-3 outline-none transition-all text-sm shadow-inner min-w-0"
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-input)',
              color: 'var(--text-primary)',
            }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--border-active)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--border-input)'}
          />

          <Button
            type="submit"
            disabled={(!text.trim() && !selectedFile) || uploading}
            className="!p-2 sm:!p-3 rounded-xl aspect-square flex-shrink-0"
          >
            {uploading ? (
              <Loader2 size={20} className="animate-spin" style={{ color: 'var(--accent-text, #fff)' }} />
            ) : (
              <Send size={20} className="translate-x-0.5 -translate-y-0.5" style={{ color: 'var(--accent-text, #fff)' }} />
            )}
          </Button>
        </form>
      </div>
    </>
  );
}

export default InputBar;
