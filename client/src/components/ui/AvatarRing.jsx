import React from 'react';
import { getInitials } from '../../utils/stringUtils';

export function AvatarRing({ src, name, size = 'md', isOnline = false, className = '' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const containerSize = {
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-18 h-18',
    xl: 'w-28 h-28'
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${sizes[size]} ${className}`}>
      {/* The Avatar itself */}
      <div className={`relative w-full h-full rounded-full overflow-hidden bg-gray-100 dark:bg-neutral-800 text-text-primaryLight dark:text-text-primaryDark flex items-center justify-center border border-border-light dark:border-border-dark`}>
        {src ? (
          <img 
            src={src} 
            alt={name} 
            className="w-full h-full object-cover" 
            onError={(e) => { e.target.style.display = 'none'; }} 
          />
        ) : null}
        {/* Fallback initials underneath */}
        <div className="absolute inset-0 flex items-center justify-center font-display font-bold text-sm -z-10">
          {getInitials(name)}
        </div>
      </div>
      
      {/* Simple online status dot */}
      {isOnline && (
        <span className="absolute bottom-0 right-0 block w-2.5 h-2.5 rounded-full bg-success ring-2 ring-white dark:ring-background-dark transform translate-x-1/4 translate-y-1/4"></span>
      )}
    </div>
  );
}
