import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminView from '../components/dashboard/AdminView';
import ProfesorView from '../components/dashboard/ProfesorView';
import AlumnoView from '../components/dashboard/AlumnoView';
import AyudanteView from '../components/dashboard/AyudanteView';

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
        return <AyudanteView />;
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
      <section className="rounded-3xl border border-outline/20 bg-surface-container-lowest p-6 shadow-sm shadow-primary/5">
        {renderView()}
      </section>
    </div>
  );
}
