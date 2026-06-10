import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export default function AlumnoView() {
  const [modalAbierta, setModalAbierta] = useState(false);
  const [impresiones, setImpresiones] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    tipoSolicitud: 'Impresion 3D',
    nombreCurso: '',
    colorOpcion1: '',
    colorOpcion2: '',
    colorOpcion3: '',
    urlModelo3d: '',
    urlModeloStl: '',
    comentario: '',
  });

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

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const crearSolicitud = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    try {
      await axios.post(`${API_URL}/api/impresion/crear`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMensaje('Solicitud de impresión creada exitosamente');
      setModalAbierta(false);

      setForm({
        tipoSolicitud: 'Impresion 3D',
        nombreCurso: '',
        colorOpcion1: '',
        colorOpcion2: '',
        colorOpcion3: '',
        urlModelo3d: '',
        urlModeloStl: '',
        comentario: '',
      });

      await cargarImpresiones();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al crear la solicitud');
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-surface-container p-6 shadow">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Mis solicitudes de impresión</h2>
            <p className="text-sm text-gray-600">
              Revisa el estado de tus solicitudes registradas.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setMensaje('');
              setError('');
              setModalAbierta(true);
            }}
            className="rounded-lg bg-primary px-4 py-3 font-semibold text-white"
          >
            Nueva solicitud
          </button>
        </div>

        {mensaje && <p className="mb-4 text-green-600">{mensaje}</p>}
        {error && <p className="mb-4 text-red-600">{error}</p>}

        <div className="space-y-4">
          {impresiones.length === 0 ? (
            <p>No tienes solicitudes registradas.</p>
          ) : (
            impresiones.map((impresion) => (
              <article
                key={impresion.id}
                className="rounded-xl border bg-white p-5 shadow-sm"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-bold">{impresion.tipoSolicitud}</h3>
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700">
                    {impresion.estado}
                  </span>
                </div>

                <p>
                  <strong>Curso:</strong> {impresion.nombreCurso}
                </p>
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
              </article>
            ))
          )}
        </div>
      </section>

      {modalAbierta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Solicitar impresión 3D</h2>

              <button
                type="button"
                onClick={() => setModalAbierta(false)}
                className="text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={crearSolicitud} className="grid grid-cols-1 gap-4">
              <input
                name="nombreCurso"
                placeholder="Nombre del curso"
                value={form.nombreCurso}
                onChange={handleChange}
                className="rounded-lg border p-3"
                required
              />

              <input
                name="colorOpcion1"
                placeholder="Color opción 1"
                value={form.colorOpcion1}
                onChange={handleChange}
                className="rounded-lg border p-3"
                required
              />

              <input
                name="colorOpcion2"
                placeholder="Color opción 2"
                value={form.colorOpcion2}
                onChange={handleChange}
                className="rounded-lg border p-3"
                required
              />

              <input
                name="colorOpcion3"
                placeholder="Color opción 3"
                value={form.colorOpcion3}
                onChange={handleChange}
                className="rounded-lg border p-3"
                required
              />

              <input
                name="urlModelo3d"
                placeholder="URL modelo 3D"
                value={form.urlModelo3d}
                onChange={handleChange}
                className="rounded-lg border p-3"
                required
              />

              <input
                name="urlModeloStl"
                placeholder="URL archivo STL"
                value={form.urlModeloStl}
                onChange={handleChange}
                className="rounded-lg border p-3"
                required
              />

              <textarea
                name="comentario"
                placeholder="Comentario"
                value={form.comentario}
                onChange={handleChange}
                className="rounded-lg border p-3"
                required
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalAbierta(false)}
                  className="rounded-lg border px-4 py-3 font-semibold"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-3 font-semibold text-white"
                >
                  Enviar solicitud
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
