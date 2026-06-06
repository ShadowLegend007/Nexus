import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Send, X, Type, Crop, RefreshCcw } from 'lucide-react';

export function MediaEditorModal({ file, onSend, onCancel }) {
  const [previewUrl, setPreviewUrl] = useState('');
  const [caption, setCaption] = useState('');
  const isVideo = file.type.startsWith('video/');
  const isImage = file.type.startsWith('image/');

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleSend = () => {
    onSend(file, caption);
  };

  return (
    <Modal isOpen={true} onClose={onCancel} title="Edit Media">
      <div className="flex flex-col space-y-4 items-center">
        <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center border border-border-primary">
          {isVideo ? (
            <video src={previewUrl} controls className="w-full h-full object-contain" />
          ) : isImage ? (
            <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
          ) : (
            <div className="text-white text-sm">File Preview Not Available</div>
          )}
        </div>

        <div className="w-full">
          <input
            type="text"
            placeholder="Add a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full rounded-xl px-4 py-3 outline-none transition-all text-sm shadow-inner"
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-input)',
              color: 'var(--text-primary)',
            }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--border-active)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--border-input)'}
            autoFocus
          />
        </div>

        <div className="flex w-full items-center justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all outline-none"
            style={{ color: 'var(--text-secondary)' }}
            onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            Cancel
          </button>
          <Button onClick={handleSend} className="gap-2">
            <Send size={16} />
            Send
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default MediaEditorModal;
