import AdminView from '../components/dashboard/AdminView';
import ProfesorView from '../components/dashboard/ProfesorView';
import AlumnoView from '../components/dashboard/AlumnoView';

export default function Home() {
  // ⚠️ temporal (luego viene del backend)
  const user = {
    name: 'Bryan',
    role: 'admin', // cambia a "profesor" o "alumno" para probar
  };

  const renderView = () => {
    switch ('profesor') {
      case 'admin':
        return <AdminView />;
      case 'profesor':
        return <ProfesorView />;
      case 'alumno':
        return <AlumnoView />;
      default:
        return <p>Rol no reconocido</p>;
    }
  };

  return (
    <main className="min-h-screen bg-background p-6">
      <h1 className="text-3xl font-bold mb-6">Bienvenido, {user.name}</h1>

      {renderView()}
    </main>
  );
}
