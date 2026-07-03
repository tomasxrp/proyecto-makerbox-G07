import React from 'react';
import PropTypes from 'prop-types';

const STYLES = {
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  info: 'bg-blue-100 text-blue-700',
  neutral: 'bg-slate-100 text-slate-700',
  danger: 'bg-rose-100 text-rose-700',
};

export default function Badge({ children, tone }) {
  const toneClass = STYLES[tone] || STYLES.neutral;

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClass}`}
    >
      {children}
    </span>
  );
}

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  tone: PropTypes.oneOf(['success', 'warning', 'info', 'neutral', 'danger']),
};

Badge.defaultProps = {
  tone: 'neutral',
};
