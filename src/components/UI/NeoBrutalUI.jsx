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

// Dropdown Component
export const NBDropdown = ({
  isOpen,
  onToggle,
  triggerLabel,
  triggerIcon,
  children,
  color = 'cyan',
  position = 'bottom',
  className = '',
  triggerClassName = '',
  contentClassName = '',
  ...props
}) => {
  const colorClasses = {
    cyan: 'nb-bg-cyan',
    yellow: 'nb-bg-yellow',
    green: 'nb-bg-green',
    purple: 'nb-bg-purple',
    red: 'nb-bg-red',
    blue: 'nb-bg-blue',
    orange: 'nb-bg-orange',
    white: 'nb-bg-white'
  };

  const positionClasses = {
    bottom: 'top-full mt-2',
    top: 'bottom-full mb-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2'
  };

  return (
    <div className={`relative ${className}`} {...props}>
      {/* Trigger Button */}
      <button
        onClick={onToggle}
        className={`
          ${colorClasses[color]} nb-border-lg nb-shadow
          px-4 py-2 font-bold uppercase text-sm
          flex items-center gap-2
          nb-hover cursor-pointer transition-all
          ${triggerClassName}
        `}
      >
        {triggerIcon && <span>{triggerIcon}</span>}
        <span>{triggerLabel}</span>
        <span className="ml-2">{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div
          className={`
            absolute ${positionClasses[position]}
            nb-bg-white nb-border-xl nb-shadow-xl
            p-4 z-50 min-w-[200px]
            ${contentClassName}
          `}
        >
          {children}
        </div>
      )}
    </div>
  );
};

// Alert/Toast Component
export const NBAlert = ({
  message,
  type = 'info',
  icon,
  onClose,
  autoClose = false,
  autoCloseDelay = 3000,
  className = '',
  ...props
}) => {
  React.useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, onClose]);

  const typeColors = {
    success: 'nb-bg-green',
    error: 'nb-bg-red',
    warning: 'nb-bg-yellow',
    info: 'nb-bg-cyan'
  };

  const typeIcons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  return (
    <div
      className={`
        ${typeColors[type]} nb-border-xl nb-shadow-xl
        p-4 flex items-center gap-3
        ${className}
      `}
      {...props}
    >
      <div className="nb-bg-white nb-border nb-shadow w-8 h-8 flex items-center justify-center font-black text-lg">
        {icon || typeIcons[type]}
      </div>
      <div className="flex-1 font-bold text-black">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="nb-bg-white nb-border nb-shadow w-8 h-8 flex items-center justify-center font-black text-lg nb-hover"
        >
          ✕
        </button>
      )}
    </div>
  );
};

// Alert Container (for managing multiple alerts)
export const NBAlertContainer = ({ alerts = [], onDismiss, position = 'top-right', className = '' }) => {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-[9999] space-y-3 max-w-md ${className}`}>
      {alerts.map((alert, index) => (
        <NBAlert
          key={alert.id || index}
          {...alert}
          onClose={() => onDismiss(alert.id || index)}
        />
      ))}
    </div>
  );
};

// Confirmation Dialog Component
export const NBConfirmDialog = ({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'green',
  cancelColor = 'red',
  className = '',
  ...props
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-70">
      <div
        className={`nb-border-xl nb-shadow-xl nb-bg-white max-w-md w-full ${className}`}
        {...props}
      >
        {/* Header */}
        <div className="nb-bg-yellow nb-border-b-lg p-6">
          <NBHeading level={3} className="text-black">{title}</NBHeading>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-black font-bold text-lg mb-6">{message}</p>

          <div className="flex gap-3">
            <NBButton
              onClick={onCancel}
              variant={cancelColor}
              size="lg"
              className="flex-1"
            >
              {cancelText}
            </NBButton>
            <NBButton
              onClick={onConfirm}
              variant={confirmColor}
              size="lg"
              className="flex-1"
            >
              {confirmText}
            </NBButton>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook for managing confirm dialogs
export const useNBConfirm = () => {
  const [confirmState, setConfirmState] = React.useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    confirmColor: 'green',
    cancelColor: 'red'
  });

  const confirm = React.useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title: options.title || 'Confirm Action',
        message: options.message || 'Are you sure?',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        confirmColor: options.confirmColor || 'green',
        cancelColor: options.cancelColor || 'red',
        onConfirm: () => {
          setConfirmState(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirmState(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  }, []);

  const ConfirmDialog = React.useCallback(() => (
    <NBConfirmDialog
      {...confirmState}
      onCancel={confirmState.onCancel}
    />
  ), [confirmState]);

  return { confirm, ConfirmDialog };
};
