import React from 'react';

export function Button({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  disabled = false, 
  loading = false,
  className = '',
  ...props 
}) {
  const baseStyle = 'relative flex items-center justify-center font-semibold text-sm py-2 px-4 rounded-xl border transition-all duration-200 outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary border-primary text-white hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/20 active:scale-95',
    secondary: 'bg-surface-dark2 border-border-dark text-text-primaryDark hover:bg-border-dark dark:bg-surface-dark2 dark:border-border-dark dark:text-text-primaryDark dark:hover:bg-border-dark light:bg-surface-light2 light:border-border-light light:text-text-primaryLight light:hover:bg-border-light',
    success: 'bg-success border-success text-white hover:bg-success/95 hover:shadow-lg hover:shadow-success/20 active:scale-95',
    warning: 'bg-warning border-warning text-white hover:bg-warning/95 hover:shadow-lg hover:shadow-warning/20 active:scale-95',
    danger: 'bg-danger border-danger text-white hover:bg-danger/95 hover:shadow-lg hover:shadow-danger/20 active:scale-95',
    outline: 'bg-transparent border-border-dark text-text-primaryDark hover:bg-surface-dark/40 dark:border-border-dark dark:text-text-primaryDark dark:hover:bg-surface-dark2/40 light:border-border-light light:text-text-primaryLight light:hover:bg-surface-light2/40',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant]} ${className}`}
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
