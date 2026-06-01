import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Send, ShieldAlert, Loader2 } from 'lucide-react';
import useFileUpload from '../../hooks/useFileUpload';
import FilePreview from './FilePreview';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

export function InputBar({ conversationId, receiverHexId, onSendMessage, socket }) {
  const [text, setText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [typing, setTyping] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { upload, uploading, progress, error, reset: resetUpload } = useFileUpload();

  // Reset file selector state when conversation changes
  useEffect(() => {
    setSelectedFile(null);
    resetUpload();
    setText('');
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

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    resetUpload();
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
      if (!uploadResult) {
        toast.error(error || 'Failed to upload attachment file.');
        return;
      }
      
      fileUrl = uploadResult.fileUrl;
      fileName = uploadResult.fileName;
      fileSize = uploadResult.fileSize;
      contentType = uploadResult.contentType;
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

  return (
    <div className="border-t border-border-dark p-4 bg-surface-dark/95 backdrop-blur dark:border-border-dark dark:bg-surface-dark/95 light:border-border-light light:bg-surface-light/95 space-y-3">
      {/* File Composition Preview Card */}
      {selectedFile && (
        <div className="flex flex-col space-y-2">
          <FilePreview file={selectedFile} onRemove={handleRemoveFile} />
          
          {/* Progress Bar Loader */}
          {uploading && (
            <div className="w-full max-w-sm bg-surface-dark2 h-1.5 rounded-full overflow-hidden dark:bg-surface-dark2">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-300 flex items-center justify-end"
                style={{ width: `${progress}%` }}
              />
              <span className="text-[10px] text-text-secondaryDark block mt-1 text-left font-mono">
                Uploading security payload... {progress}%
              </span>
            </div>
          )}
        </div>
      )}

      {/* Input composition row */}
      <form onSubmit={handleSubmit} className="flex items-center space-x-3">
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          disabled={uploading}
          className="p-2.5 rounded-xl bg-surface-dark2 border border-border-dark text-text-secondaryDark hover:text-primary disabled:opacity-50 dark:bg-surface-dark2 dark:border-border-dark light:bg-surface-light2 light:border-border-light transition-colors"
        >
          <Paperclip size={18} />
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
        />

        <input
          type="text"
          placeholder="Type a secure message... 💬"
          value={text}
          onChange={handleTextChange}
          disabled={uploading}
          className="flex-1 bg-surface-dark2 border border-border-dark text-text-primaryDark rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary disabled:opacity-50 transition-all text-sm dark:bg-surface-dark2 dark:border-border-dark dark:text-text-primaryDark light:bg-surface-light2 light:border-border-light light:text-text-primaryLight"
        />

        <Button
          type="submit"
          disabled={(!text.trim() && !selectedFile) || uploading}
          className="bg-primary border-primary hover:bg-primary/95 !p-2.5 rounded-xl aspect-square"
        >
          {uploading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </Button>
      </form>
    </div>
  );
}

export default InputBar;
