import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export default function ProfesorView() {
  const [cursos, setCursos] = useState([]);
  const [semestres, setSemestres] = useState([]);
  const [modalAbierta, setModalAbierta] = useState(false);
  const [nombreCurso, setNombreCurso] = useState('');
  const [refSemestre, setRefSemestre] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  const cargarCursos = useCallback(async () => {
    const response = await axios.get(`${API_URL}/api/curso`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const cursosProfesor = (response.data.cursos || []).filter(
      (curso) => curso.refProfesor === usuario.id
    );

    setCursos(cursosProfesor);
  }, [token, usuario.id]);

  const cargarSemestres = useCallback(async () => {
    const response = await axios.get(`${API_URL}/api/semestre`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setSemestres(response.data.semestres || []);
  }, [token]);

  useEffect(() => {
    if (token && usuario.id) {
      cargarCursos();
      cargarSemestres();
    }
  }, [token, usuario.id, cargarCursos, cargarSemestres]);

  const crearCurso = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    try {
      await axios.post(
        `${API_URL}/api/curso/crear`,
        {
          nombre: nombreCurso,
          refSemestre,
          refProfesor: usuario.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMensaje('Curso creado exitosamente');
      setModalAbierta(false);
      setNombreCurso('');
      setRefSemestre('');

      await cargarCursos();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al crear el curso');
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-surface-container p-6 shadow">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Mis cursos</h2>
            <p className="text-sm text-gray-600">
              Revisa tus cursos y monitorea las solicitudes de impresión
              asociadas.
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
            Nuevo curso
          </button>
        </div>

        {mensaje && <p className="mb-4 text-green-600">{mensaje}</p>}
        {error && <p className="mb-4 text-red-600">{error}</p>}

        <div className="space-y-4">
          {cursos.length === 0 ? (
            <p>No tienes cursos registrados.</p>
          ) : (
            cursos.map((curso) => (
              <article
                key={curso.id}
                className="rounded-xl border bg-white p-5 shadow-sm"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-bold">{curso.nombre}</h3>

                  <p className="text-sm text-gray-600">
                    Semestre: {curso.semestre?.anio} - Periodo{' '}
                    {curso.semestre?.periodo}
                  </p>

                  <p className="text-sm text-gray-600">
                    Profesor: {curso.profesor?.nombre}{' '}
                    {curso.profesor?.apellido}
                  </p>
                </div>

                <div className="mt-4">
                  <h4 className="font-semibold">Solicitudes asociadas</h4>

                  {!curso.impresions || curso.impresions.length === 0 ? (
                    <p className="mt-2 text-sm text-gray-600">
                      No hay solicitudes asociadas a este curso.
                    </p>
                  ) : (
                    <div className="mt-3 space-y-3">
                      {curso.impresions.map((impresion) => (
                        <div
                          key={impresion.id}
                          className="rounded-lg border p-3 text-sm"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <p className="font-semibold">
                              {impresion.tipoSolicitud}
                            </p>

                            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                              {impresion.estado}
                            </span>
                          </div>

                          <p>
                            <strong>Comentario:</strong> {impresion.comentario}
                          </p>

                          <p>
                            <strong>Colores:</strong> {impresion.colorOpcion1},{' '}
                            {impresion.colorOpcion2}, {impresion.colorOpcion3}
                          </p>

                          <div className="mt-2 flex gap-4">
                            <a
                              href={impresion.urlModelo3d}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary underline"
                            >
                              Ver modelo 3D
                            </a>

                            <a
                              href={impresion.urlModeloStl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary underline"
                            >
                              Ver STL
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {modalAbierta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Crear nuevo curso</h2>

              <button
                type="button"
                onClick={() => setModalAbierta(false)}
                className="text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={crearCurso} className="grid grid-cols-1 gap-4">
              <input
                placeholder="Nombre del curso"
                value={nombreCurso}
                onChange={(e) => setNombreCurso(e.target.value)}
                className="rounded-lg border p-3"
                required
              />

              <select
                value={refSemestre}
                onChange={(e) => setRefSemestre(e.target.value)}
                className="rounded-lg border p-3"
                required
              >
                <option value="">Seleccionar semestre</option>
                {semestres.map((semestre) => (
                  <option key={semestre.id} value={semestre.id}>
                    {semestre.anio} - Periodo {semestre.periodo}
                  </option>
                ))}
              </select>

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
                  Crear curso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
