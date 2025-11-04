import React from 'react';

/**
 * Neo-Brutalist UI Components
 * Reusable components following neo-brutalism design principles
 */

// Button Component
export const NBButton = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'nb-btn nb-hover-lg nb-active font-bold uppercase tracking-wide transition-all';

  const variantClasses = {
    primary: 'nb-bg-yellow nb-shadow-lg',
    success: 'nb-bg-green nb-shadow-lg',
    danger: 'nb-bg-red nb-shadow-lg',
    info: 'nb-bg-cyan nb-shadow-lg',
    purple: 'nb-bg-purple nb-shadow-lg',
    orange: 'nb-bg-orange nb-shadow-lg',
    blue: 'nb-bg-blue nb-shadow-lg',
    white: 'nb-bg-white nb-shadow-lg'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl'
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// Card Component
export const NBCard = ({
  children,
  color = 'white',
  shadow = 'xl',
  className = '',
  ...props
}) => {
  const colorClasses = {
    white: 'nb-bg-white',
    yellow: 'nb-bg-yellow',
    cyan: 'nb-bg-cyan',
    pink: 'nb-bg-pink',
    green: 'nb-bg-green',
    orange: 'nb-bg-orange',
    purple: 'nb-bg-purple',
    red: 'nb-bg-red',
    blue: 'nb-bg-blue'
  };

  const shadowClasses = {
    sm: 'nb-shadow',
    md: 'nb-shadow-lg',
    xl: 'nb-shadow-xl'
  };

  return (
    <div
      className={`nb-border-xl ${shadowClasses[shadow]} ${colorClasses[color]} p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Container Component
export const NBContainer = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`nb-container nb-bg-white ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Input Component
export const NBInput = ({
  type = 'text',
  placeholder = '',
  value,
  onChange,
  className = '',
  ...props
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`nb-input nb-bg-white w-full ${className}`}
      {...props}
    />
  );
};

// Badge Component
export const NBBadge = ({
  children,
  color = 'yellow',
  className = '',
  ...props
}) => {
  const colorClasses = {
    yellow: 'nb-bg-yellow',
    cyan: 'nb-bg-cyan',
    pink: 'nb-bg-pink',
    green: 'nb-bg-green',
    orange: 'nb-bg-orange',
    purple: 'nb-bg-purple',
    red: 'nb-bg-red',
    blue: 'nb-bg-blue'
  };

  return (
    <span
      className={`nb-border-lg nb-shadow px-3 py-1 inline-block font-bold text-sm uppercase ${colorClasses[color]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

// Modal/Dialog Component
export const NBModal = ({
  isOpen,
  onClose,
  children,
  title,
  className = '',
  ...props
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div
        className={`nb-border-xl nb-shadow-xl nb-bg-white max-w-4xl w-full max-h-[90vh] overflow-hidden ${className}`}
        {...props}
      >
        {/* Header */}
        {title && (
          <div className="nb-border-b-xl bg-yellow-300 p-6 flex justify-between items-center">
            <h2 className="nb-heading text-2xl">{title}</h2>
            <button
              onClick={onClose}
              className="nb-btn nb-bg-red px-4 py-2 text-xl font-black"
            >
              ✕
            </button>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// Tab Button Component
export const NBTabButton = ({
  children,
  isActive,
  onClick,
  icon,
  className = '',
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex-1 flex items-center justify-center gap-2 py-4 px-4 font-bold
        nb-border-lg transition-all uppercase tracking-wide
        ${isActive
          ? 'nb-bg-yellow nb-shadow-lg transform translate-y-1'
          : 'nb-bg-white hover:nb-bg-yellow hover:nb-shadow'
        }
        ${className}
      `}
      {...props}
    >
      {icon && <span className="text-xl">{icon}</span>}
      <span className="hidden sm:inline">{children}</span>
    </button>
  );
};

// Progress Bar Component
export const NBProgressBar = ({
  value,
  max,
  color = 'green',
  label,
  showValue = true,
  className = '',
  ...props
}) => {
  const percentage = (value / max) * 100;

  const colorClasses = {
    green: 'nb-bg-green',
    red: 'nb-bg-red',
    yellow: 'nb-bg-yellow',
    cyan: 'nb-bg-cyan',
    purple: 'nb-bg-purple'
  };

  return (
    <div className={`w-full ${className}`} {...props}>
      {label && (
        <div className="flex justify-between mb-2">
          <span className="font-bold text-sm uppercase">{label}</span>
          {showValue && (
            <span className="font-bold text-sm">{value} / {max}</span>
          )}
        </div>
      )}
      <div className="nb-border-lg nb-bg-white h-8 relative overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} transition-all duration-300 flex items-center justify-center`}
          style={{ width: `${percentage}%` }}
        >
          {showValue && percentage > 20 && (
            <span className="font-black text-sm">{Math.round(percentage)}%</span>
          )}
        </div>
      </div>
    </div>
  );
};

// Heading Component
export const NBHeading = ({
  children,
  level = 1,
  className = '',
  ...props
}) => {
  const Tag = `h${level}`;
  const sizeClasses = {
    1: 'text-4xl md:text-5xl',
    2: 'text-3xl md:text-4xl',
    3: 'text-2xl md:text-3xl',
    4: 'text-xl md:text-2xl',
    5: 'text-lg md:text-xl',
    6: 'text-base md:text-lg'
  };

  return (
    <Tag
      className={`nb-heading ${sizeClasses[level]} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
};

// Divider Component
export const NBDivider = ({ className = '' }) => {
  return <div className={`nb-border-lg h-1 bg-black my-6 ${className}`} />;
};
