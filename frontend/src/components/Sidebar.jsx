import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

export default function Sidebar({ isOpen, onClose }) {
  const storedUser = JSON.parse(localStorage.getItem('usuario') || '{}');
  const userRole = storedUser.rol || 'SOLICITANTE';

  const isAdmin = userRole === 'ADMINISTRADOR';
  const isProfessor = userRole === 'PROFESOR';
  const isStudent = userRole === 'ESTUDIANTE';

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Cerrar sidebar"
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-40"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-sidebar text-white shadow-2xl shadow-primary/20 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-secondary/80">
              MakerBox
            </p>
            <h2 className="text-lg font-semibold">Navegación</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-2 py-1 text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-2 px-4 py-5">
          <Link
            to="/home"
            onClick={onClose}
            className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            🏠 Inicio
          </Link>

          {isAdmin && (
            <>
              <Link
                to="/usuarios"
                onClick={onClose}
                className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
              >
                👥 Usuarios
              </Link>
              <Link
                to="/reportes"
                onClick={onClose}
                className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
              >
                📊 Reportes
              </Link>
            </>
          )}

          {isProfessor && (
            <>
              <Link
                to="/cursos"
                onClick={onClose}
                className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
              >
                📚 Cursos
              </Link>
              <Link
                to="/proyectos"
                onClick={onClose}
                className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
              >
                📦 Proyectos
              </Link>
            </>
          )}

          {isStudent && (
            <>
              <Link
                to="/mis-proyectos"
                onClick={onClose}
                className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
              >
                📦 Mis Proyectos
              </Link>
              <Link
                to="/mis-impresiones"
                onClick={onClose}
                className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
              >
                🖨️ Mis Impresiones
              </Link>
            </>
          )}
        </nav>

        <div className="border-t border-white/10 px-5 py-4 text-xs text-white/45">
          Tu rol define los accesos visibles.
        </div>
      </aside>
    </>
  );
}

Sidebar.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};

Sidebar.defaultProps = {
  isOpen: false,
  onClose: () => {},
};
