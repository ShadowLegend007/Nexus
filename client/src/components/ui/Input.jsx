import React from 'react';

export function Input({ label, icon: Icon, type = 'text', ...props }) {
  return (
    <div className="w-full flex flex-col space-y-1.5">
      {label && (
        <label
          className="text-sm font-medium ml-1"
          style={{ color: 'var(--text-primary)' }}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }}
          >
            <Icon size={18} />
          </div>
        )}
        <input
          type={type}
          className={`input-field`}
          style={{ paddingLeft: Icon ? '2.5rem' : undefined }}
          placeholder={props.placeholder || label}
          {...props}
        />
      </div>
    </div>
  );
}
