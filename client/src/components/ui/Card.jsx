import React from 'react';

export function Card({ children, className = '', hoverEffect = false, ...props }) {
  const baseClass = hoverEffect 
    ? 'card hover:-translate-y-0.5 transition-transform duration-200' 
    : 'card';
  return (
    <div className={`${baseClass} ${className}`} {...props}>
      {children}
    </div>
  );
}
