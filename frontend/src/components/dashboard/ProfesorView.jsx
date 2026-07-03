import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import EmptyState from '../ui/EmptyState';
import LoadingState from '../ui/LoadingState';
import Badge from '../ui/Badge';
import {
  listarCursos,
  listarSemestres,
  crearCurso,
  listarUsuarios,
  listarEstudiantesCurso,
  cargarCsvEstudiantes,
  listarAyudantesCurso,
  asignarAyudanteCurso,
  eliminarAyudanteCurso,
  listarGruposCurso,
  crearGrupoCurso,
  listarEstudiantesGrupo,
  asignarEstudianteGrupo,
} from '../../services/makerboxApi';

export default function ProfesorView() {
  const [cursos, setCursos] = useState([]);
  const [semestres, setSemestres] = useState([]);
  const [estudiantesSistema, setEstudiantesSistema] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [resultadoCarga, setResultadoCarga] = useState({});
  const [estudiantesPorCurso, setEstudiantesPorCurso] = useState({});
  const [ayudantesPorCurso, setAyudantesPorCurso] = useState({});
  const [gruposPorCurso, setGruposPorCurso] = useState({});
  const [estudiantesPorGrupo, setEstudiantesPorGrupo] = useState({});
  const [nombreGrupoPorCurso, setNombreGrupoPorCurso] = useState({});
  const [estudianteSeleccionadoPorGrupo, setEstudianteSeleccionadoPorGrupo] =
    useState({});
  const [cursoForm, setCursoForm] = useState({
    nombre: '',
    refSemestre: '',
  });

  const [modalCsvAbierta, setModalCsvAbierta] = useState(false);
  const [cursoCsvSeleccionado, setCursoCsvSeleccionado] = useState(null);
  const [archivoCsv, setArchivoCsv] = useState(null);

  const [modalAyudanteAbierta, setModalAyudanteAbierta] = useState(false);
  const [cursoAyudanteSeleccionado, setCursoAyudanteSeleccionado] =
    useState(null);
  const [busquedaEstudiante, setBusquedaEstudiante] = useState('');
  const [estudianteSeleccionadoId, setEstudianteSeleccionadoId] = useState('');

  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [creandoCurso, setCreandoCurso] = useState(false);
  const [cargandoCsv, setCargandoCsv] = useState(false);
  const [cargandoAyudante, setCargandoAyudante] = useState(false);

  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  const cargarAyudantesDeCursos = useCallback(
    async (cursosProfesor) => {
      const entradas = await Promise.all(
        cursosProfesor.map(async (curso) => {
          const ayudantes = await listarAyudantesCurso(token, curso.id);
          return [curso.id, ayudantes];
        })
      );

      setAyudantesPorCurso(Object.fromEntries(entradas));
    },
    [token]
  );

  const cargarDatosIniciales = useCallback(async () => {
    if (!token || !usuario.id) {
      return;
    }

    setCargandoInicial(true);
    setError('');

    try {
      const [cursosData, semestresData, usuariosData] = await Promise.all([
        listarCursos(token),
        listarSemestres(token),
        listarUsuarios(token),
      ]);

      const cursosProfesor = cursosData.filter(
        (curso) => curso.refProfesor === usuario.id
      );

      setCursos(cursosProfesor);
      setSemestres(semestresData);

      const estudiantes = usuariosData.filter(
        (item) => item.usuarioRol === 'ESTUDIANTE'
      );
      setEstudiantesSistema(estudiantes);

      await cargarAyudantesDeCursos(cursosProfesor);
      await Promise.all(
        cursosProfesor.map((curso) => listarGruposCurso(token, curso.id))
      ).then((gruposList) => {
        const gruposMap = Object.fromEntries(
          cursosProfesor.map((curso, index) => [curso.id, gruposList[index]])
        );
        setGruposPorCurso(gruposMap);
      });
    } catch (err) {
      setError(
        err.response?.data?.mensaje || 'Error al cargar datos del profesor'
      );
    } finally {
      setCargandoInicial(false);
    }
  }, [token, usuario.id, cargarAyudantesDeCursos]);

  useEffect(() => {
    cargarDatosIniciales();
  }, [cargarDatosIniciales]);

  const cargarEstudiantesDelCurso = async (cursoId) => {
    setMensaje('');
    setError('');

    try {
      const estudiantes = await listarEstudiantesCurso(token, cursoId);
      setEstudiantesPorCurso((prev) => ({
        ...prev,
        [cursoId]: estudiantes,
      }));
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
          'No se pudieron obtener estudiantes del curso.'
      );
    }
  };

  const crearNuevoCurso = async () => {
    setMensaje('');
    setError('');

    if (!cursoForm.nombre || !cursoForm.refSemestre) {
      setError('Completa nombre de curso y semestre.');
      return;
    }

    setCreandoCurso(true);

    try {
      const nuevoCurso = await crearCurso(token, {
        nombre: cursoForm.nombre,
        refSemestre: cursoForm.refSemestre,
      });

      const cursosActualizados = await listarCursos(token);
      const cursosProfesor = cursosActualizados.filter(
        (curso) => curso.refProfesor === usuario.id
      );

      setCursos(cursosProfesor);
      setCursoForm({ nombre: '', refSemestre: '' });

      setMensaje(`Curso ${nuevoCurso.nombre} creado exitosamente`);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo crear el curso');
    } finally {
      setCreandoCurso(false);
    }
  };

  const crearGrupo = async (cursoId) => {
    const nombreGrupo = (nombreGrupoPorCurso[cursoId] || '').trim();
    if (!nombreGrupo) {
      setError('Debes indicar nombre del grupo.');
      return;
    }

    setMensaje('');
    setError('');

    try {
      await crearGrupoCurso(token, cursoId, nombreGrupo);
      const grupos = await listarGruposCurso(token, cursoId);
      setGruposPorCurso((prev) => ({
        ...prev,
        [cursoId]: grupos,
      }));
      setNombreGrupoPorCurso((prev) => ({
        ...prev,
        [cursoId]: '',
      }));
      setMensaje('Grupo creado correctamente');
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo crear el grupo');
    }
  };

  const cargarEstudiantesDelGrupo = async (grupoId) => {
    try {
      const estudiantes = await listarEstudiantesGrupo(token, grupoId);
      setEstudiantesPorGrupo((prev) => ({
        ...prev,
        [grupoId]: estudiantes,
      }));
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
          'No se pudieron cargar estudiantes del grupo'
      );
    }
  };

  const asignarEstudiante = async (grupoId, cursoId) => {
    const estudianteId = estudianteSeleccionadoPorGrupo[grupoId];

    if (!estudianteId) {
      setError('Selecciona un estudiante para asignar al grupo.');
      return;
    }

    setMensaje('');
    setError('');

    try {
      await asignarEstudianteGrupo(token, grupoId, estudianteId);
      await cargarEstudiantesDelGrupo(grupoId);

      if (!estudiantesPorCurso[cursoId]) {
        await cargarEstudiantesDelCurso(cursoId);
      }

      setMensaje('Estudiante asignado al grupo');
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
          'No se pudo asignar el estudiante al grupo'
      );
    }
  };

  const abrirModalCsv = (curso) => {
    setCursoCsvSeleccionado(curso);
    setArchivoCsv(null);
    setModalCsvAbierta(true);
    setMensaje('');
    setError('');
  };

  const cerrarModalCsv = () => {
    if (cargandoCsv) {
      return;
    }

    setModalCsvAbierta(false);
    setCursoCsvSeleccionado(null);
    setArchivoCsv(null);
  };

  const subirCsv = async () => {
    setMensaje('');
    setError('');

    if (!cursoCsvSeleccionado || !archivoCsv) {
      setError('Debe seleccionar un archivo CSV');
      return;
    }

    setCargandoCsv(true);

    try {
      const resultado = await cargarCsvEstudiantes(
        token,
        cursoCsvSeleccionado.id,
        archivoCsv
      );

      setResultadoCarga((prev) => ({
        ...prev,
        [cursoCsvSeleccionado.id]: resultado,
      }));

      await cargarEstudiantesDelCurso(cursoCsvSeleccionado.id);
      setMensaje('CSV cargado exitosamente');
      cerrarModalCsv();
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
          err.response?.data?.error ||
          'Error al cargar CSV'
      );
    } finally {
      setCargandoCsv(false);
    }
  };

  const abrirModalAyudante = (curso) => {
    setCursoAyudanteSeleccionado(curso);
    setEstudianteSeleccionadoId('');
    setBusquedaEstudiante('');
    setModalAyudanteAbierta(true);
    setMensaje('');
    setError('');
  };

  const cerrarModalAyudante = () => {
    if (cargandoAyudante) {
      return;
    }

    setModalAyudanteAbierta(false);
    setCursoAyudanteSeleccionado(null);
    setEstudianteSeleccionadoId('');
    setBusquedaEstudiante('');
  };

  const estudiantesFiltrados = useMemo(() => {
    const termino = busquedaEstudiante.trim().toLowerCase();

    const ayudantesAsignadosIds = new Set(
      (ayudantesPorCurso[cursoAyudanteSeleccionado?.id] || []).map(
        (item) => item.usuario?.id || item.refUsuario
      )
    );

    return estudiantesSistema
      .filter((estudiante) => !ayudantesAsignadosIds.has(estudiante.id))
      .filter((estudiante) => {
        if (!termino) {
          return true;
        }

        return [
          estudiante.nombre,
          estudiante.apellido,
          estudiante.correo,
          estudiante.rut,
        ]
          .join(' ')
          .toLowerCase()
          .includes(termino);
      });
  }, [
    busquedaEstudiante,
    estudiantesSistema,
    ayudantesPorCurso,
    cursoAyudanteSeleccionado,
  ]);

  const confirmarAsignacionAyudante = async () => {
    if (!cursoAyudanteSeleccionado || !estudianteSeleccionadoId) {
      setError('Debes seleccionar un estudiante para asignarlo como ayudante.');
      return;
    }

    setCargandoAyudante(true);
    setMensaje('');
    setError('');

    try {
      await asignarAyudanteCurso(
        token,
        cursoAyudanteSeleccionado.id,
        estudianteSeleccionadoId
      );

      const ayudantesActualizados = await listarAyudantesCurso(
        token,
        cursoAyudanteSeleccionado.id
      );

      setAyudantesPorCurso((prev) => ({
        ...prev,
        [cursoAyudanteSeleccionado.id]: ayudantesActualizados,
      }));

      setMensaje('Ayudante asignado correctamente');
      cerrarModalAyudante();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo asignar ayudante');
    } finally {
      setCargandoAyudante(false);
    }
  };

  const quitarAyudante = async (cursoId, usuarioId) => {
    setMensaje('');
    setError('');

    try {
      await eliminarAyudanteCurso(token, cursoId, usuarioId);

      const ayudantesActualizados = await listarAyudantesCurso(token, cursoId);
      setAyudantesPorCurso((prev) => ({
        ...prev,
        [cursoId]: ayudantesActualizados,
      }));

      setMensaje('Ayudante removido del curso');
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo quitar el ayudante');
    }
  };

  if (cargandoInicial) {
    return <LoadingState label="Cargando cursos del profesor..." />;
  }

  return (
    <div className="space-y-6">
      <Card
        title="Crear curso"
        subtitle="Crea cursos nuevos sin salir del panel."
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[2fr,1fr,auto]">
          <input
            type="text"
            value={cursoForm.nombre}
            onChange={(event) =>
              setCursoForm((prev) => ({
                ...prev,
                nombre: event.target.value,
              }))
            }
            placeholder="Nombre del curso"
            className="rounded-xl border border-outline/30 p-3"
          />

          <select
            value={cursoForm.refSemestre}
            onChange={(event) =>
              setCursoForm((prev) => ({
                ...prev,
                refSemestre: event.target.value,
              }))
            }
            className="rounded-xl border border-outline/30 p-3"
          >
            <option value="">Selecciona semestre</option>
            {semestres.map((semestre) => (
              <option key={semestre.id} value={semestre.id}>
                {semestre.anio} - {semestre.periodo}
              </option>
            ))}
          </select>

          <Button onClick={crearNuevoCurso} loading={creandoCurso}>
            Crear curso
          </Button>
        </div>
      </Card>

      <Card
        title="Mis cursos"
        subtitle="Revisa tus cursos, carga estudiantes y asigna ayudantes por curso."
      >
        {mensaje && (
          <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            {mensaje}
          </p>
        )}

        {error && (
          <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </p>
        )}

        <div className="space-y-5">
          {cursos.length === 0 ? (
            <EmptyState
              title="No tienes cursos asignados"
              description="Cuando te asignen cursos aparecerán en esta sección."
            />
          ) : (
            cursos.map((curso) => (
              <article
                key={curso.id}
                className="rounded-2xl border border-outline/20 bg-white p-5 shadow-sm"
              >
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
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
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => abrirModalAyudante(curso)}
                    >
                      Asignar ayudante
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => abrirModalCsv(curso)}
                    >
                      Subir CSV
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => cargarEstudiantesDelCurso(curso.id)}
                    >
                      Ver estudiantes
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  <div className="rounded-xl border border-outline/20 p-4">
                    <h4 className="font-semibold">Ayudantes del curso</h4>
                    <div className="mt-3 space-y-2">
                      {(ayudantesPorCurso[curso.id] || []).length === 0 ? (
                        <p className="text-sm text-on-surface-variant">
                          Aún no hay ayudantes asignados.
                        </p>
                      ) : (
                        (ayudantesPorCurso[curso.id] || []).map((registro) => {
                          const ayudante = registro.usuario;

                          return (
                            <div
                              key={registro.id || `${curso.id}-${ayudante?.id}`}
                              className="flex items-center justify-between rounded-lg border p-3"
                            >
                              <div>
                                <p className="text-sm font-semibold">
                                  {ayudante?.nombre} {ayudante?.apellido}
                                </p>
                                <p className="text-xs text-on-surface-variant">
                                  {ayudante?.correo}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() =>
                                  quitarAyudante(curso.id, ayudante?.id)
                                }
                              >
                                Quitar
                              </Button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-outline/20 p-4">
                    <h4 className="font-semibold">Carga de estudiantes CSV</h4>
                    {resultadoCarga[curso.id] && (
                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
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
                        <h5 className="mb-2 text-sm font-semibold">
                          Estudiantes del curso
                        </h5>
                        <div className="space-y-2">
                          {estudiantesPorCurso[curso.id].map((item) => {
                            const estudiante = item.estudiante || item;

                            return (
                              <div
                                key={estudiante.id || estudiante.correo}
                                className="rounded-lg border p-2 text-sm"
                              >
                                <p>
                                  <strong>Nombre:</strong> {estudiante.nombre}{' '}
                                  {estudiante.apellido}
                                </p>
                                <p>
                                  <strong>Correo:</strong> {estudiante.correo}
                                </p>
                                {estudiante.esPendiente && (
                                  <p className="text-xs font-semibold text-amber-700">
                                    Pendiente de registro (cargado por CSV)
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-outline/20 p-4">
                  <h4 className="font-semibold">Grupos del curso</h4>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Crea grupos y asigna estudiantes de forma simple.
                  </p>

                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <input
                      type="text"
                      value={nombreGrupoPorCurso[curso.id] || ''}
                      onChange={(event) =>
                        setNombreGrupoPorCurso((prev) => ({
                          ...prev,
                          [curso.id]: event.target.value,
                        }))
                      }
                      placeholder="Nombre del grupo"
                      className="w-full rounded-xl border border-outline/30 p-3"
                    />
                    <Button onClick={() => crearGrupo(curso.id)}>
                      Crear grupo
                    </Button>
                  </div>

                  {(gruposPorCurso[curso.id] || []).length === 0 ? (
                    <p className="mt-3 text-sm text-on-surface-variant">
                      Aún no hay grupos para este curso.
                    </p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {(gruposPorCurso[curso.id] || []).map((grupo) => (
                        <article
                          key={grupo.id}
                          className="rounded-lg border border-outline/20 p-3"
                        >
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <p className="font-semibold">{grupo.nombreGrupo}</p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                cargarEstudiantesDelGrupo(grupo.id)
                              }
                            >
                              Ver integrantes
                            </Button>
                          </div>

                          <div className="flex flex-col gap-2 sm:flex-row">
                            <select
                              value={
                                estudianteSeleccionadoPorGrupo[grupo.id] || ''
                              }
                              onChange={(event) =>
                                setEstudianteSeleccionadoPorGrupo((prev) => ({
                                  ...prev,
                                  [grupo.id]: event.target.value,
                                }))
                              }
                              className="w-full rounded-xl border border-outline/30 p-2"
                            >
                              <option value="">Selecciona estudiante</option>
                              {(estudiantesPorCurso[curso.id] || []).map(
                                (item) => {
                                  const estudiante = item.estudiante || item;

                                  if (estudiante.esPendiente) {
                                    return null;
                                  }

                                  return (
                                    <option
                                      key={estudiante.id}
                                      value={estudiante.id}
                                    >
                                      {estudiante.nombre} {estudiante.apellido}
                                    </option>
                                  );
                                }
                              )}
                            </select>
                            <Button
                              size="sm"
                              onClick={() =>
                                asignarEstudiante(grupo.id, curso.id)
                              }
                            >
                              Asignar
                            </Button>
                          </div>

                          {(estudiantesPorCurso[curso.id] || []).filter(
                            (item) => {
                              const estudiante = item.estudiante || item;
                              return !estudiante.esPendiente;
                            }
                          ).length === 0 && (
                            <p className="text-xs text-amber-700">
                              No hay estudiantes registrados disponibles para
                              asignar. Los pendientes deben registrarse primero.
                            </p>
                          )}

                          {(estudiantesPorGrupo[grupo.id] || []).length > 0 && (
                            <div className="mt-3 space-y-2">
                              {(estudiantesPorGrupo[grupo.id] || []).map(
                                (registro) => (
                                  <p
                                    key={`${grupo.id}-${registro.refEstudiante}`}
                                    className="rounded-md bg-surface-container/40 p-2 text-sm"
                                  >
                                    {registro.estudiante?.nombre}{' '}
                                    {registro.estudiante?.apellido} ·{' '}
                                    {registro.estudiante?.correo}
                                  </p>
                                )
                              )}
                            </div>
                          )}
                        </article>
                      ))}
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
                            <Badge tone="warning">{impresion.estado}</Badge>
                          </div>

                          <p>
                            <strong>Comentario:</strong> {impresion.comentario}
                          </p>

                          <p>
                            <strong>Solicitante:</strong>{' '}
                            {impresion.estudiante
                              ? `${impresion.estudiante.nombre || ''} ${
                                  impresion.estudiante.apellido || ''
                                }`.trim() || 'Sin nombre'
                              : impresion.solicitanteNombre ||
                                'Sin nombre'}{' '}
                            ·{' '}
                            {impresion.estudiante
                              ? impresion.estudiante.correo || 'Sin correo'
                              : impresion.solicitanteCorreo || 'Sin correo'}
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
      </Card>

      <Modal
        open={modalCsvAbierta && Boolean(cursoCsvSeleccionado)}
        onClose={cerrarModalCsv}
        title="Cargar estudiantes"
        description={`Curso: ${cursoCsvSeleccionado?.nombre || ''}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Selecciona el archivo CSV exportado desde Educandus para cargar los
            estudiantes del curso.
          </p>

          <div>
            <p className="mb-2 block text-sm font-semibold text-gray-700">
              Archivo CSV
            </p>

            <label
              htmlFor="archivo-csv"
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition hover:border-primary hover:bg-primary/5"
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
              onChange={(event) => setArchivoCsv(event.target.files[0])}
              className="sr-only"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={cerrarModalCsv}
              disabled={cargandoCsv}
            >
              Cancelar
            </Button>
            <Button onClick={subirCsv} loading={cargandoCsv}>
              {cargandoCsv ? 'Procesando...' : 'Procesar CSV'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={modalAyudanteAbierta && Boolean(cursoAyudanteSeleccionado)}
        onClose={cerrarModalAyudante}
        title="Asignar ayudante"
        description={`Selecciona un estudiante existente para ${cursoAyudanteSeleccionado?.nombre || ''}`}
      >
        <div className="space-y-4">
          <input
            type="text"
            value={busquedaEstudiante}
            onChange={(event) => setBusquedaEstudiante(event.target.value)}
            placeholder="Buscar por nombre, apellido, correo o RUT"
            className="w-full rounded-xl border border-outline/30 p-3"
          />

          <div className="max-h-72 space-y-2 overflow-y-auto rounded-xl border border-outline/20 p-2">
            {estudiantesFiltrados.length === 0 ? (
              <EmptyState
                title="Sin estudiantes disponibles"
                description="No hay estudiantes que coincidan con la búsqueda o ya están asignados."
              />
            ) : (
              estudiantesFiltrados.map((estudiante) => (
                <button
                  type="button"
                  key={estudiante.id}
                  onClick={() => setEstudianteSeleccionadoId(estudiante.id)}
                  className={`w-full rounded-lg border p-3 text-left transition ${
                    estudianteSeleccionadoId === estudiante.id
                      ? 'border-primary bg-primary/5'
                      : 'border-outline/20 hover:bg-surface-container/40'
                  }`}
                >
                  <p className="font-semibold">
                    {estudiante.nombre} {estudiante.apellido}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {estudiante.correo} · {estudiante.rut}
                  </p>
                </button>
              ))
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={cerrarModalAyudante}
              disabled={cargandoAyudante}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmarAsignacionAyudante}
              loading={cargandoAyudante}
            >
              Asignar ayudante
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
