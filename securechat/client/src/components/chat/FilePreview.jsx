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
    return <File size={24} className="text-text-secondaryDark" />;
  };

  return (
    <div className="flex items-center justify-between p-3 bg-surface-dark border border-border-dark rounded-xl w-full max-w-sm animate-fade-in relative overflow-hidden dark:bg-surface-dark dark:border-border-dark light:bg-surface-light light:border-border-light">
      {/* Background glow indicating secure check scan queuing */}
      <div className="absolute right-0 top-0 text-[8px] font-bold text-primary/30 uppercase tracking-widest px-2 py-1 flex items-center">
        <Shield size={10} className="mr-1" />
        AI Queued
      </div>

      <div className="flex items-center space-x-3 pr-8 text-left">
        <div className="p-2 bg-surface-dark2 rounded-lg dark:bg-surface-dark2 light:bg-surface-light2">
          {getIcon()}
        </div>
        <div className="overflow-hidden">
          <h4 className="text-xs font-bold text-text-primaryDark truncate w-48">
            {file.name}
          </h4>
          <span className="text-[10px] text-text-secondaryDark">
            {formatBytes(file.size)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="p-1 rounded-lg hover:bg-surface-dark2 text-text-secondaryDark hover:text-text-primaryDark dark:hover:bg-surface-dark2 light:hover:bg-surface-light2 transition-colors outline-none"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export default FilePreview;
