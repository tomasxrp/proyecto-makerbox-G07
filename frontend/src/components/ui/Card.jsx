import React from 'react';
import PropTypes from 'prop-types';

export default function Card({
  title,
  subtitle,
  actions,
  className,
  children,
}) {
  return (
    <section
      className={`rounded-3xl border border-outline/20 bg-surface-container-lowest p-5 shadow-sm shadow-primary/5 ${className}`}
    >
      {(title || subtitle || actions) && (
        <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title && (
              <h3 className="text-lg font-bold text-on-surface">{title}</h3>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-on-surface-variant">{subtitle}</p>
            )}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

Card.propTypes = {
  title: PropTypes.node,
  subtitle: PropTypes.node,
  actions: PropTypes.node,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

Card.defaultProps = {
  title: null,
  subtitle: null,
  actions: null,
  className: '',
};
