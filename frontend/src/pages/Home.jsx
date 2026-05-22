import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminView from '../components/dashboard/AdminView';
import ProfesorView from '../components/dashboard/ProfesorView';
import AlumnoView from '../components/dashboard/AlumnoView';

const formatLastAccess = (value) => {
  if (!value) {
    return 'Sin registro';
  }

  const lastAccessDate = new Date(value);

  if (Number.isNaN(lastAccessDate.getTime())) {
    return 'Sin registro';
  }

  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(lastAccessDate);
};

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
    }
  }, [navigate]);
  const storedUser = JSON.parse(localStorage.getItem('usuario') || '{}');
  const userName = storedUser.nombre || 'Usuario';
  const userRole = storedUser.rol || 'SOLICITANTE';
  const userEmail = storedUser.correo || 'Correo no registrado';
  const lastAccess = formatLastAccess(localStorage.getItem('ultimoAcceso'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('ultimoAcceso');
    navigate('/login');
  };

  const renderView = () => {
    switch (userRole) {
      case 'ADMINISTRADOR':
        return <AdminView />;
      case 'PROFESOR':
        return <ProfesorView />;
      case 'ESTUDIANTE':
        return <AlumnoView />;
      case 'SOLICITANTE':
        return <p>Vista de solicitante en construcción</p>;

      case 'AYUDANTE':
        return <p>Vista de ayudante en construcción</p>;
      default:
        return <p>Rol no reconocido</p>;
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-outline/20 bg-surface-container-lowest/90 p-6 shadow-sm shadow-primary/5 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-on-surface-variant">
          Bienvenido
        </p>
        <h1 className="mt-2 text-3xl font-bold text-on-surface sm:text-4xl">
          Hola, {userName}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-on-surface-variant">
          Desde aquí puedes revisar tu actividad, ver los accesos disponibles y
          trabajar con una interfaz más limpia y consistente.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-outline/20 bg-surface-container-lowest p-6 shadow-sm shadow-primary/5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-on-surface-variant">
            Sesión activa
          </p>
          <h2 className="mt-2 text-xl font-bold text-on-surface">{userName}</h2>
          <p className="mt-2 text-sm text-on-surface-variant">{userEmail}</p>
        </article>

        <article className="rounded-3xl border border-outline/20 bg-surface-container-lowest p-6 shadow-sm shadow-primary/5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-on-surface-variant">
            Rol asignado
          </p>
          <h2 className="mt-2 text-xl font-bold text-on-surface">{userRole}</h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            La vista se adapta automáticamente a los permisos guardados en la
            sesión.
          </p>
        </article>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-3xl border border-outline/20 bg-primary px-6 py-6 text-left text-white shadow-sm shadow-primary/10 transition hover:bg-primary-container"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
            Último acceso
          </p>
          <h2 className="mt-2 text-xl font-bold">{lastAccess}</h2>
          <p className="mt-2 text-sm text-white/80">
            Cerrar sesión para volver al formulario de ingreso.
          </p>
        </button>
      </section>

      <section className="rounded-3xl border border-outline/20 bg-surface-container-lowest p-6 shadow-sm shadow-primary/5">
        {renderView()}
      </section>
    </div>
  );
}
