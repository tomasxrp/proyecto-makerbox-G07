import { Link } from 'react-router-dom';

export default function Sidebar() {
  const user = {
    name: 'Bryan',
    role: 'profesor', // cambia esto para probar
  };

  return (
    <aside className="w-64 min-h-screen bg-primary text-white p-5">
      {/* Usuario */}
      <div className="mb-8">
        <h2 className="text-xl font-bold">{user.name}</h2>
        <p className="text-sm opacity-70 capitalize">{user.role}</p>
      </div>

      <nav className="flex flex-col gap-4">
        <Link to="/home" className="hover:bg-white/10 p-2 rounded">
          🏠 Inicio
        </Link>

        {/* ADMIN */}
        {user.role === 'admin' && (
          <>
            <Link to="/usuarios" className="hover:bg-white/10 p-2 rounded">
              👥 Usuarios
            </Link>

            <Link to="/reportes" className="hover:bg-white/10 p-2 rounded">
              📊 Reportes
            </Link>
          </>
        )}

        {/* PROFESOR */}
        {user.role === 'profesor' && (
          <>
            <Link to="/cursos" className="hover:bg-white/10 p-2 rounded">
              📚 Cursos
            </Link>

            <Link to="/proyectos" className="hover:bg-white/10 p-2 rounded">
              📦 Proyectos
            </Link>
          </>
        )}

        {/* ALUMNO */}
        {user.role === 'alumno' && (
          <>
            <Link to="/mis-proyectos" className="hover:bg-white/10 p-2 rounded">
              📦 Mis Proyectos
            </Link>

            <Link
              to="/mis-impresiones"
              className="hover:bg-white/10 p-2 rounded"
            >
              🖨️ Mis Impresiones
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
}
