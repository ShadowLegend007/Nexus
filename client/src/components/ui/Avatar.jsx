import React from 'react';

export function Avatar({ 
  src, 
  name = '', 
  size = 'md', 
  className = '',
  status = null // 'online' | 'offline' | null
}) {
  const sizes = {
    xs: 'w-7 h-7 text-xs',
    sm: 'w-9 h-9 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
  };

  const getInitials = (n) => {
    if (!n) return '';
    const parts = n.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizes[size]} rounded-full object-cover border border-border-dark/60 dark:border-border-dark/60 light:border-border-light/60`}
          onError={(e) => {
            // If image fails to load, clear src to trigger fallback to initials
            e.target.src = '';
            e.target.style.display = 'none';
          }}
        />
      ) : (
        <div className={`${sizes[size]} rounded-full border border-border-dark bg-surface-dark2 text-text-primaryDark flex items-center justify-center font-bold dark:border-border-dark dark:bg-surface-dark2 dark:text-text-primaryDark light:border-border-light light:bg-surface-light2 light:text-text-primaryLight`}>
          {getInitials(name)}
        </div>
      )}
      
      {/* Online indicator dot */}
      {status && (
        <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-background-dark dark:ring-background-dark light:ring-background-light ${
          status === 'online' ? 'bg-success' : 'bg-text-mutedDark'
        }`} />
      )}
    </div>
  );
}

export default Avatar;
