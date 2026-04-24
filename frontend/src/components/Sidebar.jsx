import { Link } from 'react-router-dom';

export default function Sidebar() {
  const storedUser = JSON.parse(localStorage.getItem('usuario') || '{}');
  const userName = storedUser.nombre || 'Usuario';
  const userRole = storedUser.rol || 'SOLICITANTE';

  const isAdmin = userRole === 'ADMINISTRADOR';
  const isProfessor = userRole === 'PROFESOR';
  const isStudent = userRole === 'ESTUDIANTE';

  return (
    <aside className="w-64 min-h-screen bg-primary text-white p-5">
      {/* Usuario */}
      <div className="mb-8">
        <h2 className="text-xl font-bold">{userName}</h2>
        <p className="text-sm opacity-70">{userRole}</p>
      </div>

      <nav className="flex flex-col gap-4">
        <Link to="/home" className="hover:bg-white/10 p-2 rounded">
          🏠 Inicio
        </Link>

        {/* ADMIN */}
        {isAdmin && (
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
        {isProfessor && (
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
        {isStudent && (
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
