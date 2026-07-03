import React from 'react';
import PropTypes from 'prop-types';

const VARIANT_STYLES = {
  primary:
    'bg-primary text-white hover:bg-primary-container focus:ring-primary border border-transparent',
  secondary:
    'bg-surface-container text-on-surface hover:bg-surface-container-lowest focus:ring-primary border border-outline/30',
  outline:
    'bg-white text-on-surface hover:bg-surface-container focus:ring-primary border border-outline/30',
  danger:
    'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 border border-transparent',
  ghost:
    'bg-transparent text-on-surface hover:bg-surface-container focus:ring-primary border border-transparent',
};

const SIZE_STYLES = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-sm',
};

export default function Button({
  children,
  type,
  onClick,
  variant,
  size,
  disabled,
  loading,
  className,
}) {
  const variantClass = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;
  const sizeClass = SIZE_STYLES[size] || SIZE_STYLES.md;

  return (
    <button
      type={type === 'submit' ? 'submit' : 'button'}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variantClass} ${sizeClass} ${className}`}
    >
      {loading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['button', 'submit']),
  onClick: PropTypes.func,
  variant: PropTypes.oneOf([
    'primary',
    'secondary',
    'outline',
    'danger',
    'ghost',
  ]),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  className: PropTypes.string,
};

Button.defaultProps = {
  type: 'button',
  onClick: undefined,
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  className: '',
};
