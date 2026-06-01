import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({ 
  children, 
  title, 
  isOpen, 
  onClose,
  maxWidth = 'max-w-md'
}) {
  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Modal Dialog Card */}
      <div 
        className={`w-full ${maxWidth} rounded-2xl border bg-surface-dark border-border-dark dark:bg-surface-dark dark:border-border-dark light:bg-surface-light light:border-border-light shadow-2xl relative overflow-hidden transform scale-100 transition-all duration-300`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-dark dark:border-border-dark light:border-border-light">
          <h3 className="text-lg font-bold text-text-primaryDark dark:text-text-primaryDark light:text-text-primaryLight">
            {title}
          </h3>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg hover:bg-surface-dark2 hover:text-text-primaryDark dark:hover:bg-surface-dark2 dark:hover:text-text-primaryDark light:hover:bg-surface-light2 light:hover:text-text-primaryLight text-text-secondaryDark transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
