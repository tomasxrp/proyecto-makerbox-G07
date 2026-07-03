import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from './Button';

const SIZE_CLASS = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
};

export default function Modal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  size,
  closeOnOverlay,
}) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <button
        type="button"
        aria-label="Cerrar modal"
        onClick={() => {
          if (closeOnOverlay) {
            onClose();
          }
        }}
        className="absolute inset-0 cursor-default"
      />

      <section
        className={`relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl ${SIZE_CLASS[size] || SIZE_CLASS.md}`}
      >
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-on-surface">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-on-surface-variant">
                {description}
              </p>
            )}
          </div>

          <Button variant="ghost" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </header>

        <div>{children}</div>

        {footer && <footer className="mt-6">{footer}</footer>}
      </section>
    </div>
  );
}

Modal.propTypes = {
  open: PropTypes.bool,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  closeOnOverlay: PropTypes.bool,
};

Modal.defaultProps = {
  open: false,
  description: '',
  footer: null,
  size: 'md',
  closeOnOverlay: true,
};
