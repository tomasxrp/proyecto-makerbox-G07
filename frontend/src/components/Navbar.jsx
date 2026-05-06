import { useNavigate } from 'react-router-dom';

export default function Navbar({ onToggleSidebar }) {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('usuario') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-white/10 bg-primary/95 px-4 text-white shadow-lg shadow-primary/10 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-full border border-white/15 bg-white/5 px-3 py-2 transition hover:bg-white/15"
        >
          ☰
        </button>

        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.35em] text-white/60">
            MakerBox
          </p>
          <h1 className="text-lg font-semibold leading-tight">
            Panel académico
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 sm:flex">
          <span className="h-2 w-2 rounded-full bg-secondary" />
          <span>
            {user.nombre || 'Usuario'} · {user.rol || 'ROL'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/20"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
