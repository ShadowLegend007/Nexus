import React from 'react';
import { File, Image, Video, Music, X, Shield } from 'lucide-react';
import { formatBytes } from '../../utils/fileValidator';

export function FilePreview({ file, onRemove }) {
  if (!file) return null;

  const getIcon = () => {
    const type = file.type || '';
    if (type.startsWith('image/')) return <Image size={24} className="text-primary" />;
    if (type.startsWith('video/')) return <Video size={24} className="text-info" />;
    if (type.startsWith('audio/')) return <Music size={24} className="text-success" />;
    return <File size={24} className="text-text-secondaryLight dark:text-text-secondaryDark" />;
  };

  return (
    <div
      className="flex items-center justify-between p-3 rounded-xl w-full max-w-sm animate-fade-in relative overflow-hidden transition-colors"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-primary)',
      }}
    >
      {/* Background glow indicating secure check scan queuing */}
      <div
        className="absolute right-0 top-0 text-[8px] font-bold uppercase tracking-widest px-2 py-1 flex items-center"
        style={{ color: 'var(--accent)', opacity: 0.7 }}
      >
        <Shield size={10} className="mr-1" />
        AI Queued
      </div>

      <div className="flex items-center space-x-3 pr-8 text-left">
        <div className="p-2 rounded-lg" style={{ background: 'var(--bg-hover)' }}>
          {getIcon()}
        </div>
        <div className="overflow-hidden">
          <h4 className="text-xs font-bold truncate w-48" style={{ color: 'var(--text-primary)' }}>
            {file.name}
          </h4>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            {formatBytes(file.size)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="p-1 rounded-lg transition-colors outline-none"
        style={{ color: 'var(--text-muted)' }}
        onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
        onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
      >
        <X size={16} />
      </button>
    </div>
  );
}

export default FilePreview;
