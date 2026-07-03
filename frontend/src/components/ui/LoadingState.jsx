import React from 'react';
import PropTypes from 'prop-types';

export default function LoadingState({ label }) {
  return (
    <div className="rounded-2xl border border-outline/20 bg-surface-container-lowest p-6">
      <div className="flex items-center gap-3 text-sm text-on-surface-variant">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent" />
        <span>{label}</span>
      </div>
    </div>
  );
}

LoadingState.propTypes = {
  label: PropTypes.string,
};

LoadingState.defaultProps = {
  label: 'Cargando información...',
};
