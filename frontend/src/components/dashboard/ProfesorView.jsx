import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export default function ProfesorView() {
  const [cursos, setCursos] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [resultadoCarga, setResultadoCarga] = useState({});
  const [estudiantesPorCurso, setEstudiantesPorCurso] = useState({});

  const [modalCsvAbierta, setModalCsvAbierta] = useState(false);
  const [cursoCsvSeleccionado, setCursoCsvSeleccionado] = useState(null);
  const [archivoCsv, setArchivoCsv] = useState(null);

  const [cargandoCsv, setCargandoCsv] = useState(false);

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
  const cargarEstudiantesCurso = useCallback(
    async (refCurso) => {
      const response = await axios.get(
        `${API_URL}/api/estudiante-curso/curso/${refCurso}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEstudiantesPorCurso((prev) => ({
        ...prev,
        [refCurso]: response.data.estudiantes || [],
      }));
    },
    [token]
  );

  useEffect(() => {
    if (token && usuario.id) {
      cargarCursos();
    }
  }, [token, usuario.id, cargarCursos]);

  const subirCsv = async () => {
    setMensaje('');
    setError('');

    if (!cursoCsvSeleccionado || !archivoCsv) {
      setError('Debe seleccionar un archivo CSV');
      return;
    }

    setCargandoCsv(true);

    const formData = new FormData();
    formData.append('refCurso', cursoCsvSeleccionado.id);
    formData.append('archivo', archivoCsv);

    try {
      const response = await axios.post(
        `${API_URL}/api/estudiante-curso/cargar-csv`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setResultadoCarga((prev) => ({
        ...prev,
        [cursoCsvSeleccionado.id]: response.data.resultado,
      }));

      await cargarEstudiantesCurso(cursoCsvSeleccionado.id);

      setMensaje('CSV cargado exitosamente');
      setArchivoCsv(null);
      setModalCsvAbierta(false);
      setCursoCsvSeleccionado(null);
    } catch (err) {
      console.error('Error completo al cargar CSV:', err);
      console.error('Respuesta backend:', err.response?.data);

      setError(
        err.response?.data?.mensaje ||
          err.response?.data?.error ||
          'Error al cargar CSV'
      );
    } finally {
      setCargandoCsv(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-surface-container p-6 shadow">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Mis cursos</h2>
            <p className="text-sm text-gray-600">
              Revisa tus cursos asignados, carga estudiantes y monitorea
              solicitudes.
            </p>
          </div>
        </div>

        {mensaje && <p className="mb-4 text-green-600">{mensaje}</p>}
        {error && <p className="mb-4 text-red-600">{error}</p>}

        <div className="space-y-4">
          {cursos.length === 0 ? (
            <p>No tienes cursos asignados.</p>
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

                <div className="mt-4 rounded-lg border p-4">
                  <h4 className="font-semibold">Carga de estudiantes CSV</h4>

                  <div className="mt-3 flex flex-col gap-3 md:flex-row">
                    <button
                      type="button"
                      onClick={() => {
                        setCursoCsvSeleccionado(curso);
                        setArchivoCsv(null);
                        setModalCsvAbierta(true);
                      }}
                      className="rounded-lg bg-primary px-4 py-2 font-semibold text-white transition hover:scale-[1.02] hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      Subir CSV
                    </button>

                    <button
                      type="button"
                      onClick={() => cargarEstudiantesCurso(curso.id)}
                      className="rounded-lg border px-4 py-2 font-semibold transition hover:scale-[1.02] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      Ver estudiantes
                    </button>
                  </div>

                  {resultadoCarga[curso.id] && (
                    <div className="mt-3 text-sm">
                      <p>
                        Asignados:{' '}
                        {resultadoCarga[curso.id].asignados?.length || 0}
                      </p>
                      <p>
                        Ya asignados:{' '}
                        {resultadoCarga[curso.id].yaAsignados?.length || 0}
                      </p>
                      <p>
                        Pendientes:{' '}
                        {resultadoCarga[curso.id].pendientes?.length || 0}
                      </p>
                      <p>
                        No válidos:{' '}
                        {resultadoCarga[curso.id].noValidos?.length || 0}
                      </p>
                    </div>
                  )}

                  {estudiantesPorCurso[curso.id] && (
                    <div className="mt-4">
                      <h4 className="font-semibold">Estudiantes del curso</h4>

                      <div className="mt-2 space-y-2">
                        {estudiantesPorCurso[curso.id]?.map((item) => {
                          const estudiante = item.estudiante || item;

                          return (
                            <div
                              key={estudiante.id || estudiante.correo}
                              className="rounded-lg border p-3 text-sm"
                            >
                              <p>
                                <strong>Nombre:</strong> {estudiante.nombre}{' '}
                                {estudiante.apellido}
                              </p>
                              <p>
                                <strong>Correo:</strong> {estudiante.correo}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
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

      {modalCsvAbierta && cursoCsvSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Cargar estudiantes</h2>
                <p className="text-sm text-gray-600">
                  Curso: {cursoCsvSeleccionado.nombre}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setModalCsvAbierta(false);
                  setCursoCsvSeleccionado(null);
                  setArchivoCsv(null);
                }}
                className="text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Selecciona el archivo CSV exportado desde Educandus para cargar
                los estudiantes del curso.
              </p>

              <div>
                <p className="mb-2 block text-sm font-semibold text-gray-700">
                  Archivo CSV
                </p>

                <label
                  htmlFor="archivo-csv"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition hover:scale-[1.01] hover:border-primary hover:bg-primary/5 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
                >
                  <span className="text-sm font-semibold text-gray-700">
                    {archivoCsv
                      ? archivoCsv.name
                      : 'Haz clic para seleccionar un CSV'}
                  </span>

                  <span className="mt-1 text-xs text-gray-500">
                    Solo archivos .csv
                  </span>
                </label>

                <input
                  id="archivo-csv"
                  type="file"
                  accept=".csv"
                  onChange={(e) => setArchivoCsv(e.target.files[0])}
                  className="sr-only"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  disabled={cargandoCsv}
                  onClick={() => {
                    setModalCsvAbierta(false);
                    setCursoCsvSeleccionado(null);
                    setArchivoCsv(null);
                  }}
                  className="rounded-lg border px-4 py-3 font-semibold transition hover:scale-[1.02] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={subirCsv}
                  disabled={cargandoCsv}
                  className="rounded-lg bg-primary px-4 py-3 font-semibold text-white transition hover:scale-[1.02] hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                >
                  {cargandoCsv ? 'Procesando...' : 'Procesar CSV'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
