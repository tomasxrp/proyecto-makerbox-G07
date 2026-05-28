import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const initialStats = {
  usuariosTotales: 0,
  administradores: 0,
  profesores: 0,
  ayudantes: 0,
  estudiantes: 0,
  solicitantes: 0,
  impresionesTotales: 0,
  impresionesPendientes: 0,
  impresionesEnProceso: 0,
  impresionesCompletadas: 0,
};

export default function AdminView() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    const cargarMetricas = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [usuariosResponse, impresionesResponse] = await Promise.all([
          axios.get(`${API_URL}/api/usuarios`, { headers }),
          axios.get(`${API_URL}/api/impresiones`, { headers }),
        ]);

        const usuarios = usuariosResponse.data.usuarios || [];
        const impresiones = impresionesResponse.data.impresiones || [];

        const conteoUsuariosPorRol = {};
        usuarios.forEach(({ usuarioRol }) => {
          conteoUsuariosPorRol[usuarioRol] =
            (conteoUsuariosPorRol[usuarioRol] || 0) + 1;
        });

        const conteoImpresionesPorEstado = {};
        impresiones.forEach(({ estado }) => {
          conteoImpresionesPorEstado[estado] =
            (conteoImpresionesPorEstado[estado] || 0) + 1;
        });

        const nextStats = {
          usuariosTotales: usuarios.length,
          administradores: conteoUsuariosPorRol.ADMINISTRADOR || 0,
          profesores: conteoUsuariosPorRol.PROFESOR || 0,
          ayudantes: conteoUsuariosPorRol.AYUDANTE || 0,
          estudiantes: conteoUsuariosPorRol.ESTUDIANTE || 0,
          solicitantes: conteoUsuariosPorRol.SOLICITANTE || 0,
          impresionesTotales: impresiones.length,
          impresionesPendientes: conteoImpresionesPorEstado.PENDIENTE || 0,
          impresionesEnProceso: conteoImpresionesPorEstado.EN_PROCESO || 0,
          impresionesCompletadas: conteoImpresionesPorEstado.COMPLETADA || 0,
        };

        setStats(nextStats);
      } catch (error) {
        setErrorMsg(
          (error.response &&
            error.response.data &&
            error.response.data.mensaje) ||
            'Error al cargar métricas del admin'
        );
      } finally {
        setLoading(false);
      }
    };

    cargarMetricas();
  }, [navigate]);

  const cards = [
    {
      title: 'Usuarios totales',
      value: stats.usuariosTotales,
      description: 'Usuarios registrados en el sistema',
    },
    {
      title: 'Administradores',
      value: stats.administradores,
      description: 'Usuarios con permisos completos',
    },
    {
      title: 'Profesores',
      value: stats.profesores,
      description: 'Crean ayudantes y gestionan cursos',
    },
    {
      title: 'Ayudantes',
      value: stats.ayudantes,
      description: 'Operan el flujo de atención',
    },
    {
      title: 'Estudiantes',
      value: stats.estudiantes,
      description: 'Solicitan impresión y actividades académicas',
    },
    {
      title: 'Solicitantes',
      value: stats.solicitantes,
      description: 'Usuarios externos o generales',
    },
    {
      title: 'Impresiones totales',
      value: stats.impresionesTotales,
      description: 'Solicitudes cargadas en el sistema',
    },
    {
      title: 'Pendientes',
      value: stats.impresionesPendientes,
      description: 'Solicitudes aún sin revisar',
    },
    {
      title: 'En proceso',
      value: stats.impresionesEnProceso,
      description: 'Trabajos ya tomados por ayudantes',
    },
    {
      title: 'Completadas',
      value: stats.impresionesCompletadas,
      description: 'Trabajos ya terminados',
    },
  ];

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-outline/20 bg-surface-container-lowest p-6 shadow-sm shadow-primary/5">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-on-surface-variant">
          Panel administrativo
        </p>
        <h1 className="mt-2 text-3xl font-bold text-on-surface">
          Vista general del sistema
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">
          Estas métricas salen de los usuarios y solicitudes de impresión que ya
          existen en el backend.
        </p>
      </div>

      {loading && (
        <div className="rounded-2xl border border-outline/20 bg-surface-container-lowest p-6 text-sm text-on-surface-variant">
          Cargando métricas...
        </div>
      )}

      {!loading && errorMsg && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {errorMsg}
        </div>
      )}

      {!loading && !errorMsg && (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <article
              key={card.title}
              className="rounded-3xl border border-outline/20 bg-surface-container-lowest p-6 shadow-sm shadow-primary/5"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-on-surface-variant">
                {card.title}
              </p>
              <p className="mt-3 text-4xl font-bold text-on-surface">
                {card.value}
              </p>
              <p className="mt-2 text-sm text-on-surface-variant">
                {card.description}
              </p>
            </article>
          ))}
        </section>
      )}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <button
          type="button"
          onClick={() => navigate('/usuarios')}
          className="rounded-2xl bg-primary px-5 py-4 text-left text-white shadow-sm transition hover:bg-primary-container"
        >
          <p className="text-sm uppercase tracking-[0.25em] text-white/70">
            Acción rápida
          </p>
          <h2 className="mt-2 text-lg font-semibold">Gestionar usuarios</h2>
        </button>

        <button
          type="button"
          onClick={() => navigate('/mis-impresiones')}
          className="rounded-2xl bg-surface-container-lowest px-5 py-4 text-left shadow-sm shadow-primary/5 transition hover:bg-surface-container"
        >
          <p className="text-sm uppercase tracking-[0.25em] text-on-surface-variant">
            Acción rápida
          </p>
          <h2 className="mt-2 text-lg font-semibold text-on-surface">
            Revisar impresiones
          </h2>
        </button>

        <button
          type="button"
          className="rounded-2xl bg-surface-container-lowest px-5 py-4 text-left shadow-sm shadow-primary/5 transition hover:bg-surface-container"
        >
          <p className="text-sm uppercase tracking-[0.25em] text-on-surface-variant">
            Próximo paso
          </p>
          <h2 className="mt-2 text-lg font-semibold text-on-surface">
            Configurar semestre
          </h2>
        </button>
      </section>
    </section>
  );
}
