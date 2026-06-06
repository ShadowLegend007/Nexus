import React from 'react';

export function Button({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  disabled = false, 
  loading = false,
  className = '',
  style = {},
  ...props 
}) {
  const baseClass = 'relative flex items-center justify-center gap-2 font-semibold text-sm py-2 px-4 rounded-xl transition-all duration-200 outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  
  // For primary variant: use CSS variable-based colors for full theme support
  const primaryStyle = variant === 'primary' ? {
    background: 'var(--accent)',
    color: 'var(--accent-text, #ffffff)',
    border: '1px solid var(--accent)',
    boxShadow: '0 2px 8px var(--accent-glow)',
    ...style,
  } : style;

  const variantClass = {
    primary: '',
    secondary: 'btn-secondary',
    success: 'bg-success border-success text-white hover:bg-success/90 active:scale-95',
    warning: 'bg-warning border-warning text-white hover:bg-warning/90 active:scale-95',
    danger: 'bg-danger border-danger text-white hover:bg-danger/90 active:scale-95',
    outline: 'bg-transparent border text-text-primary hover:bg-neutral-100 dark:hover:bg-neutral-800',
  }[variant] || '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClass} ${variantClass} ${className}`}
      style={primaryStyle}
      onMouseOver={variant === 'primary' ? (e) => { e.currentTarget.style.background = 'var(--accent-hover)'; e.currentTarget.style.boxShadow = '0 4px 16px var(--accent-glow)'; } : undefined}
      onMouseOut={variant === 'primary' ? (e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 2px 8px var(--accent-glow)'; } : undefined}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
}

export default Button;
