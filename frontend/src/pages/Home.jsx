import AdminView from '../components/dashboard/AdminView';
import ProfesorView from '../components/dashboard/ProfesorView';
import AlumnoView from '../components/dashboard/AlumnoView';

export default function Home() {
  const storedUser = JSON.parse(localStorage.getItem('usuario') || '{}');
  const userName = storedUser.nombre || 'Usuario';
  const userRole = storedUser.rol || 'SOLICITANTE';

  const renderView = () => {
    switch (userRole) {
      case 'ADMINISTRADOR':
        return <AdminView />;
      case 'PROFESOR':
        return <ProfesorView />;
      case 'ESTUDIANTE':
        return <AlumnoView />;
      default:
        return <p>Rol no reconocido</p>;
    }
  };

  return (
    <main className="min-h-screen bg-background p-6">
      <h1 className="text-3xl font-bold mb-6">Bienvenido, {userName}</h1>

      {renderView()}
    </main>
  );
}
