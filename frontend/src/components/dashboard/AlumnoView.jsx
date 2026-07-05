import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import EmptyState from '../ui/EmptyState';
import LoadingState from '../ui/LoadingState';
import Badge from '../ui/Badge';
import {
  listarMisSolicitudes,
  crearSolicitudImpresion,
  listarMisCursos,
  listarCursosAyudante,
  listarSolicitudesAyudante,
  actualizarSolicitudAyudante,
} from '../../services/makerboxApi';

const ESTADOS = ['PENDIENTE', 'EN_PROCESO', 'COMPLETADA', 'CANCELADA'];

const formInicial = {
  tipoSolicitud: 'Impresion 3D',
  nombreCurso: '',
  refCurso: '',
  colorOpcion1: '',
  colorOpcion2: '',
  colorOpcion3: '',
  urlModelo3d: '',
  urlModeloStl: '',
  modelo3d: null,
  modeloStl: null,
  comentario: '',
};

const inputClassName =
  'rounded-lg border border-outline/30 p-3 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

export default function AlumnoView() {
  const [modalAbierta, setModalAbierta] = useState(false);
  const [impresiones, setImpresiones] = useState([]);
  const [misCursos, setMisCursos] = useState([]);
  const [cursosAyudante, setCursosAyudante] = useState([]);
  const [solicitudesAyudante, setSolicitudesAyudante] = useState([]);
  const [cursoSeleccionadoSolicitud, setCursoSeleccionadoSolicitud] =
    useState(null);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState(formInicial);

  const [loadingGeneral, setLoadingGeneral] = useState(true);
  const [loadingSolicitud, setLoadingSolicitud] = useState(false);
  const [actualizandoSolicitudId, setActualizandoSolicitudId] = useState('');

  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  const cargarDatos = useCallback(async () => {
    if (!token) {
      return;
    }

    setLoadingGeneral(true);

    try {
      const [
        misSolicitudesData,
        misCursosData,
        cursosAyData,
        solicitudesAyData,
      ] = await Promise.all([
        listarMisSolicitudes(token),
        listarMisCursos(token, usuario.id),
        listarCursosAyudante(token).catch(() => []),
        listarSolicitudesAyudante(token).catch(() => []),
      ]);

      setImpresiones(misSolicitudesData);
      setMisCursos(misCursosData);
      setCursosAyudante(cursosAyData);
      setSolicitudesAyudante(solicitudesAyData);
    } catch (err) {
      setError(
        err.response?.data?.mensaje || 'No se pudo cargar tu información.'
      );
    } finally {
      setLoadingGeneral(false);
    }
  }, [token, usuario.id]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleChange = (event) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleFileChange = (event) => {
    const { name, files } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: files?.[0] || null,
    }));
  };

  const abrirModalNuevaSolicitud = (curso) => {
    setMensaje('');
    setError('');
    setCursoSeleccionadoSolicitud(curso);
    setForm((prev) => ({
      ...prev,
      refCurso: curso.id,
      nombreCurso: curso.nombre,
    }));
    setModalAbierta(true);
  };

  const cerrarModalNuevaSolicitud = () => {
    if (loadingSolicitud) {
      return;
    }

    setModalAbierta(false);
    setCursoSeleccionadoSolicitud(null);
  };

  const crearSolicitud = async (event) => {
    event.preventDefault();
    setMensaje('');
    setError('');
    setLoadingSolicitud(true);

    try {
      if (
        (!form.urlModelo3d && !form.modelo3d) ||
        (!form.urlModeloStl && !form.modeloStl)
      ) {
        throw new Error(
          'Debes adjuntar archivos o ingresar URLs para ambos modelos'
        );
      }

      await crearSolicitudImpresion(token, {
        ...form,
        modelo3d: form.modelo3d,
        modeloStl: form.modeloStl,
      });
      setMensaje('Solicitud de impresión creada exitosamente');
      setModalAbierta(false);
      setForm(formInicial);
      setCursoSeleccionadoSolicitud(null);
      await cargarDatos();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al crear la solicitud');
    } finally {
      setLoadingSolicitud(false);
    }
  };

  const cambiarEstadoAyudante = async (solicitudId, estado) => {
    setMensaje('');
    setError('');
    setActualizandoSolicitudId(solicitudId);

    try {
      await actualizarSolicitudAyudante(token, solicitudId, { estado });
      setMensaje(`Estado actualizado a ${estado}`);
      await cargarDatos();
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
          'No se pudo actualizar la solicitud asignada.'
      );
    } finally {
      setActualizandoSolicitudId('');
    }
  };

  const cursosAyudanteIds = useMemo(
    () => new Set(cursosAyudante.map((curso) => curso.id)),
    [cursosAyudante]
  );

  const solicitudesPorGestionar = useMemo(
    () =>
      solicitudesAyudante.filter(
        (solicitud) =>
          !solicitud.refCurso ||
          cursosAyudanteIds.size === 0 ||
          cursosAyudanteIds.has(solicitud.refCurso)
      ),
    [solicitudesAyudante, cursosAyudanteIds]
  );

  const getSolicitudesPorCurso = (curso) =>
    impresiones.filter(
      (impresion) =>
        impresion.refCurso === curso.id ||
        impresion.nombreCurso === curso.nombre
    );

  if (loadingGeneral) {
    return <LoadingState label="Cargando panel de estudiante..." />;
  }

  return (
    <div className="space-y-6">
      {mensaje && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {mensaje}
        </p>
      )}

      {error && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </p>
      )}

      <Card
        title="Mis cursos"
        subtitle="Cursos donde estás inscrito. Crea y revisa solicitudes desde cada curso."
      >
        {misCursos.length === 0 ? (
          <EmptyState
            title="Aún no tienes cursos registrados"
            description="Cuando te inscriban o te asocien a un curso, aparecerá en esta sección."
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {misCursos.map((curso) => (
              <article
                key={curso.id}
                className="rounded-xl border border-outline/20 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-on-surface">
                      {curso.nombre}
                    </p>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {curso.semestre
                        ? `Semestre ${curso.semestre.anio} - Periodo ${curso.semestre.periodo}`
                        : 'Semestre no disponible'}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => abrirModalNuevaSolicitud(curso)}
                  >
                    Crear solicitud de impresión
                  </Button>
                </div>

                <div className="mt-4 space-y-2">
                  <p className="text-sm font-semibold text-on-surface">
                    Solicitudes de este curso
                  </p>
                  {getSolicitudesPorCurso(curso).length === 0 ? (
                    <p className="text-sm text-on-surface-variant">
                      Aún no tienes solicitudes para este curso.
                    </p>
                  ) : (
                    getSolicitudesPorCurso(curso).map((impresion) => (
                      <div
                        key={impresion.id}
                        className="rounded-lg border border-outline/20 p-3"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-sm font-semibold">
                            {impresion.tipoSolicitud ||
                              'Solicitud de impresión'}
                          </p>
                          <Badge tone="warning">{impresion.estado}</Badge>
                        </div>
                        <p className="text-sm text-on-surface-variant">
                          {impresion.comentario}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>

      {cursosAyudante.length > 0 && (
        <Card
          title="Cursos donde soy ayudante"
          subtitle="Estos permisos dependen de tu asignación por curso, no de tu rol global."
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {cursosAyudante.map((curso) => (
              <article
                key={curso.id}
                className="rounded-xl border border-outline/20 bg-white p-4"
              >
                <p className="font-semibold">{curso.nombre}</p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Semestre: {curso.semestre?.anio} - {curso.semestre?.periodo}
                </p>
              </article>
            ))}
          </div>
        </Card>
      )}

      {(cursosAyudante.length > 0 || solicitudesPorGestionar.length > 0) && (
        <Card
          title="Solicitudes por gestionar"
          subtitle="Gestiona solicitudes donde estés asignado como ayudante."
        >
          {solicitudesPorGestionar.length === 0 ? (
            <EmptyState
              title="No tienes solicitudes por gestionar"
              description="Cuando lleguen solicitudes en tus cursos asignados aparecerán aquí."
            />
          ) : (
            <div className="space-y-3">
              {solicitudesPorGestionar.map((solicitud) => (
                <article
                  key={solicitud.id}
                  className="rounded-xl border border-outline/20 bg-white p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-semibold">{solicitud.nombreCurso}</p>
                    <Badge tone="warning">{solicitud.estado}</Badge>
                  </div>

                  <p className="text-sm text-on-surface-variant">
                    {solicitud.comentario}
                  </p>

                  <p className="mt-1 text-sm text-on-surface">
                    <strong>Solicitante:</strong>{' '}
                    {solicitud.estudiante
                      ? `${solicitud.estudiante.nombre || ''} ${
                          solicitud.estudiante.apellido || ''
                        }`.trim() || 'Sin nombre'
                      : solicitud.solicitanteNombre || 'Sin nombre'}{' '}
                    ·{' '}
                    {solicitud.estudiante
                      ? solicitud.estudiante.correo || 'Sin correo'
                      : solicitud.solicitanteCorreo || 'Sin correo'}
                  </p>

                  {!['COMPLETADA', 'CANCELADA'].includes(solicitud.estado) && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {ESTADOS.map((estado) => (
                        <Button
                          key={estado}
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            cambiarEstadoAyudante(solicitud.id, estado)
                          }
                          disabled={
                            actualizandoSolicitudId === solicitud.id ||
                            solicitud.estado === estado
                          }
                        >
                          {estado}
                        </Button>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </Card>
      )}

      <Modal
        open={modalAbierta}
        onClose={cerrarModalNuevaSolicitud}
        title="Solicitar impresión 3D"
        description={`Curso: ${cursoSeleccionadoSolicitud?.nombre || ''}`}
      >
        <form onSubmit={crearSolicitud} className="grid grid-cols-1 gap-4">
          <div className="rounded-lg border border-outline/20 bg-surface-container/40 p-3 text-sm text-on-surface">
            La solicitud quedará asociada a:{' '}
            {cursoSeleccionadoSolicitud?.nombre}
          </div>

          <input
            name="colorOpcion1"
            placeholder="Color opción 1"
            value={form.colorOpcion1}
            onChange={handleChange}
            className={inputClassName}
            required
          />

          <input
            name="colorOpcion2"
            placeholder="Color opción 2"
            value={form.colorOpcion2}
            onChange={handleChange}
            className={inputClassName}
            required
          />

          <input
            name="colorOpcion3"
            placeholder="Color opción 3"
            value={form.colorOpcion3}
            onChange={handleChange}
            className={inputClassName}
            required
          />

          <input
            name="urlModelo3d"
            placeholder="URL modelo 3D (opcional si adjuntas archivo)"
            value={form.urlModelo3d}
            onChange={handleChange}
            className={inputClassName}
          />

          <input
            type="file"
            name="modelo3d"
            accept=".stl,.obj,.3mf,.zip,.rar,.7z"
            onChange={handleFileChange}
            className={inputClassName}
          />

          <input
            name="urlModeloStl"
            placeholder="URL archivo STL (opcional si adjuntas archivo)"
            value={form.urlModeloStl}
            onChange={handleChange}
            className={inputClassName}
          />

          <input
            type="file"
            name="modeloStl"
            accept=".stl,.obj,.3mf,.zip,.rar,.7z"
            onChange={handleFileChange}
            className={inputClassName}
          />

          <textarea
            name="comentario"
            placeholder="Comentario"
            value={form.comentario}
            onChange={handleChange}
            className={inputClassName}
            required
          />

          <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
            <Button
              variant="outline"
              onClick={cerrarModalNuevaSolicitud}
              disabled={loadingSolicitud}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={loadingSolicitud}>
              Enviar solicitud
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
