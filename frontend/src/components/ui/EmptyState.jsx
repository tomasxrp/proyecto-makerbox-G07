import React from 'react';
import PropTypes from 'prop-types';

export default function EmptyState({ title, description, action, className }) {
  return (
    <div
      className={`rounded-2xl bg-surface-container/40 p-6 text-center ${className}`}
    >
      <p className="text-base font-semibold text-on-surface">{title}</p>
      <p className="mt-1 text-sm text-on-surface-variant">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

EmptyState.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  action: PropTypes.node,
  className: PropTypes.string,
};

EmptyState.defaultProps = {
  description: '',
  action: null,
  className: '',
};
