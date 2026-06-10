import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const ESTADOS = ['PENDIENTE', 'EN_PROCESO', 'COMPLETADA', 'CANCELADA'];

export default function AyudanteView() {
  const [impresiones, setImpresiones] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  const cargarImpresiones = useCallback(async () => {
    const response = await axios.get(`${API_URL}/api/impresion`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setImpresiones(response.data.impresiones || []);
  }, [token]);

  useEffect(() => {
    if (token) {
      cargarImpresiones();
    }
  }, [token, cargarImpresiones]);

  const cambiarEstado = async (impresionId, estado) => {
    setMensaje('');
    setError('');

    try {
      await axios.put(
        `${API_URL}/api/impresion/${impresionId}/estado`,
        { estado },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMensaje(`Estado actualizado a ${estado}`);
      await cargarImpresiones();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al actualizar el estado');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-on-surface">
          Solicitudes de impresión
        </h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          Revisa las solicitudes realizadas por estudiantes y actualiza su
          estado.
        </p>
      </div>

      {mensaje && (
        <p className="rounded-lg bg-green-100 p-3 text-green-700">{mensaje}</p>
      )}
      {error && (
        <p className="rounded-lg bg-red-100 p-3 text-red-700">{error}</p>
      )}

      <div className="space-y-4">
        {impresiones.length === 0 ? (
          <p>No hay solicitudes de impresión registradas.</p>
        ) : (
          impresiones.map((impresion) => (
            <article
              key={impresion.id}
              className="rounded-2xl border border-outline/20 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-on-surface">
                    {impresion.tipoSolicitud}
                  </h3>
                  <p className="text-sm text-on-surface-variant">
                    Curso: {impresion.nombreCurso}
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    Creada:{' '}
                    {new Date(impresion.creadoEn).toLocaleString('es-CL')}
                  </p>
                </div>

                <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700">
                  {impresion.estado}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                <p>
                  <strong>Colores:</strong> {impresion.colorOpcion1},{' '}
                  {impresion.colorOpcion2}, {impresion.colorOpcion3}
                </p>

                <p>
                  <strong>Comentario:</strong> {impresion.comentario}
                </p>

                <p>
                  <strong>Modelo 3D:</strong>{' '}
                  <a
                    href={impresion.urlModelo3d}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline"
                  >
                    Ver modelo
                  </a>
                </p>

                <p>
                  <strong>Archivo STL:</strong>{' '}
                  <a
                    href={impresion.urlModeloStl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline"
                  >
                    Ver STL
                  </a>
                </p>
              </div>

              {!['COMPLETADA', 'CANCELADA'].includes(impresion.estado) ? (
                <div className="mt-5 flex flex-wrap gap-3">
                  {ESTADOS.map((estado) => (
                    <button
                      key={estado}
                      type="button"
                      disabled={impresion.estado === estado}
                      onClick={() => cambiarEstado(impresion.id, estado)}
                      className="rounded-lg border px-4 py-2 text-sm font-semibold transition hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {estado}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-5 rounded-lg bg-gray-100 p-3 text-sm font-semibold text-gray-600">
                  Esta solicitud ya se encuentra en estado final y no puede ser
                  modificada.
                </p>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
