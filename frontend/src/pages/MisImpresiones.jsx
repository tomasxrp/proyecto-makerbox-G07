import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PropTypes from 'prop-types';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const estadoClasses = {
  PENDIENTE: 'bg-amber-100 text-amber-800',
  EN_PROCESO: 'bg-blue-100 text-blue-800',
  COMPLETADA: 'bg-emerald-100 text-emerald-800',
  CANCELADA: 'bg-rose-100 text-rose-800',
};

function FormField({ id, label, children, fullWidth = false }) {
  return (
    <div
      className={`grid gap-2 text-sm font-semibold text-on-surface-variant ${
        fullWidth ? 'md:col-span-2' : ''
      }`}
    >
      <span id={`${id}-label`}>{label}</span>
      {children}
    </div>
  );
}

FormField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  fullWidth: PropTypes.bool,
};

FormField.defaultProps = {
  fullWidth: false,
};

export default function MisImpresiones() {
  const navigate = useNavigate();
  const [impresiones, setImpresiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [form, setForm] = useState({
    solicitanteNombre: '',
    solicitanteApellido: '',
    solicitanteCorreo: '',
    solicitanteRut: '',
    tipoSolicitud: 'SOLICITANTE',
    nombreCurso: '',
    refCurso: '',
    colorOpcion1: '',
    colorOpcion2: '',
    colorOpcion3: '',
    comentarioTecnico: '',
    urlModelo3d: '',
    urlModeloStl: '',
    comentario: '',
    tiempoEstimadoImpresion: '',
  });

  const obtenerImpresiones = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/api/impresiones`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setImpresiones(response.data.impresiones || []);
    } catch (error) {
      setErrorMsg(
        (error.response &&
          error.response.data &&
          error.response.data.mensaje) ||
          'Error al obtener impresiones'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = JSON.parse(localStorage.getItem('usuario') || '{}');

    if (!token) {
      navigate('/login');
      return;
    }

    setForm((currentForm) => ({
      ...currentForm,
      solicitanteNombre: storedUser.nombre || currentForm.solicitanteNombre,
      solicitanteApellido:
        storedUser.apellido || currentForm.solicitanteApellido,
      tipoSolicitud: storedUser.rol || currentForm.tipoSolicitud,
    }));

    obtenerImpresiones(token);
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);

    const token = localStorage.getItem('token');

    try {
      await axios.post(`${API_URL}/api/impresiones`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccessMsg('Solicitud de impresion creada con exito');
      await obtenerImpresiones(token);
    } catch (error) {
      setErrorMsg(
        (error.response &&
          error.response.data &&
          error.response.data.mensaje) ||
          'Error al crear la impresion'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-outline/20 bg-surface-container-lowest p-6 shadow-sm shadow-primary/5">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-on-surface-variant">
          Módulo de impresión
        </p>
        <h1 className="mt-2 text-3xl font-bold text-on-surface">
          Mis impresiones
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">
          Aquí se mostrará el historial y el estado actual de cada solicitud de
          impresión.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-3xl border border-outline/20 bg-surface-container-lowest p-6 shadow-sm shadow-primary/5"
      >
        <div>
          <h2 className="text-xl font-semibold text-on-surface">
            Nueva solicitud
          </h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Completa los datos mínimos para registrar la solicitud.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField id="solicitanteNombre" label="Nombre">
            <input
              aria-labelledby="solicitanteNombre-label"
              id="solicitanteNombre"
              name="solicitanteNombre"
              value={form.solicitanteNombre}
              onChange={handleChange}
              className="rounded-xl border border-outline/30 bg-white px-4 py-3 text-on-surface outline-none focus:border-primary"
              type="text"
              required
            />
          </FormField>

          <FormField id="solicitanteApellido" label="Apellido">
            <input
              aria-labelledby="solicitanteApellido-label"
              id="solicitanteApellido"
              name="solicitanteApellido"
              value={form.solicitanteApellido}
              onChange={handleChange}
              className="rounded-xl border border-outline/30 bg-white px-4 py-3 text-on-surface outline-none focus:border-primary"
              type="text"
              required
            />
          </FormField>

          <FormField id="solicitanteCorreo" label="Correo">
            <input
              aria-labelledby="solicitanteCorreo-label"
              id="solicitanteCorreo"
              name="solicitanteCorreo"
              value={form.solicitanteCorreo}
              onChange={handleChange}
              className="rounded-xl border border-outline/30 bg-white px-4 py-3 text-on-surface outline-none focus:border-primary"
              type="email"
              required
            />
          </FormField>

          <FormField id="solicitanteRut" label="RUT">
            <input
              aria-labelledby="solicitanteRut-label"
              id="solicitanteRut"
              name="solicitanteRut"
              value={form.solicitanteRut}
              onChange={handleChange}
              className="rounded-xl border border-outline/30 bg-white px-4 py-3 text-on-surface outline-none focus:border-primary"
              type="text"
              required
            />
          </FormField>

          <FormField id="tipoSolicitud" label="Tipo de solicitud">
            <select
              aria-labelledby="tipoSolicitud-label"
              id="tipoSolicitud"
              name="tipoSolicitud"
              value={form.tipoSolicitud}
              onChange={handleChange}
              className="rounded-xl border border-outline/30 bg-white px-4 py-3 text-on-surface outline-none focus:border-primary"
            >
              <option value="SOLICITANTE">Solicitante</option>
              <option value="ESTUDIANTE">Estudiante</option>
            </select>
          </FormField>

          <FormField id="tiempoEstimadoImpresion" label="Tiempo estimado">
            <input
              aria-labelledby="tiempoEstimadoImpresion-label"
              id="tiempoEstimadoImpresion"
              name="tiempoEstimadoImpresion"
              value={form.tiempoEstimadoImpresion}
              onChange={handleChange}
              className="rounded-xl border border-outline/30 bg-white px-4 py-3 text-on-surface outline-none focus:border-primary"
              type="text"
              placeholder="Ej. 3 horas"
            />
          </FormField>

          <FormField id="comentario" label="Comentario" fullWidth>
            <textarea
              aria-labelledby="comentario-label"
              id="comentario"
              name="comentario"
              value={form.comentario}
              onChange={handleChange}
              className="min-h-28 rounded-xl border border-outline/30 bg-white px-4 py-3 text-on-surface outline-none focus:border-primary"
              required
            />
          </FormField>

          <FormField id="colorOpcion1" label="Color opción 1">
            <input
              aria-labelledby="colorOpcion1-label"
              id="colorOpcion1"
              name="colorOpcion1"
              value={form.colorOpcion1}
              onChange={handleChange}
              className="rounded-xl border border-outline/30 bg-white px-4 py-3 text-on-surface outline-none focus:border-primary"
              type="text"
              required
            />
          </FormField>

          <FormField id="colorOpcion2" label="Color opción 2">
            <input
              aria-labelledby="colorOpcion2-label"
              id="colorOpcion2"
              name="colorOpcion2"
              value={form.colorOpcion2}
              onChange={handleChange}
              className="rounded-xl border border-outline/30 bg-white px-4 py-3 text-on-surface outline-none focus:border-primary"
              type="text"
              required
            />
          </FormField>

          <FormField id="colorOpcion3" label="Color opción 3">
            <input
              aria-labelledby="colorOpcion3-label"
              id="colorOpcion3"
              name="colorOpcion3"
              value={form.colorOpcion3}
              onChange={handleChange}
              className="rounded-xl border border-outline/30 bg-white px-4 py-3 text-on-surface outline-none focus:border-primary"
              type="text"
              required
            />
          </FormField>

          <FormField id="urlModelo3d" label="URL modelo 3D">
            <input
              aria-labelledby="urlModelo3d-label"
              id="urlModelo3d"
              name="urlModelo3d"
              value={form.urlModelo3d}
              onChange={handleChange}
              className="rounded-xl border border-outline/30 bg-white px-4 py-3 text-on-surface outline-none focus:border-primary"
              type="url"
              required
            />
          </FormField>

          <FormField id="urlModeloStl" label="URL modelo STL">
            <input
              aria-labelledby="urlModeloStl-label"
              id="urlModeloStl"
              name="urlModeloStl"
              value={form.urlModeloStl}
              onChange={handleChange}
              className="rounded-xl border border-outline/30 bg-white px-4 py-3 text-on-surface outline-none focus:border-primary"
              type="url"
              required
            />
          </FormField>

          <FormField id="comentarioTecnico" label="Comentario técnico">
            <input
              aria-labelledby="comentarioTecnico-label"
              id="comentarioTecnico"
              name="comentarioTecnico"
              value={form.comentarioTecnico}
              onChange={handleChange}
              className="rounded-xl border border-outline/30 bg-white px-4 py-3 text-on-surface outline-none focus:border-primary"
              type="text"
            />
          </FormField>

          <FormField id="nombreCurso" label="Curso">
            <input
              aria-labelledby="nombreCurso-label"
              id="nombreCurso"
              name="nombreCurso"
              value={form.nombreCurso}
              onChange={handleChange}
              className="rounded-xl border border-outline/30 bg-white px-4 py-3 text-on-surface outline-none focus:border-primary"
              type="text"
            />
          </FormField>
        </div>

        {successMsg && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {successMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-fit rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? 'Guardando...' : 'Crear solicitud'}
        </button>
      </form>

      {loading && (
        <div className="rounded-2xl border border-outline/20 bg-surface-container-lowest p-6 text-sm text-on-surface-variant">
          Cargando impresiones...
        </div>
      )}

      {errorMsg && !loading && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {errorMsg}
        </div>
      )}

      {!loading && !errorMsg && impresiones.length === 0 && (
        <div className="rounded-2xl border border-outline/20 bg-surface-container-lowest p-6 text-sm text-on-surface-variant">
          Todavía no hay impresiones registradas.
        </div>
      )}

      <div className="grid gap-4">
        {impresiones.map((impresion) => (
          <article
            key={impresion.id}
            className="rounded-3xl border border-outline/20 bg-surface-container-lowest p-5 shadow-sm shadow-primary/5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-on-surface">
                  {impresion.tipoSolicitud || 'Solicitud'}
                </h2>
                <p className="text-sm text-on-surface-variant">
                  {impresion.solicitanteNombre || 'Sin nombre'}{' '}
                  {impresion.solicitanteApellido || ''}
                </p>
              </div>

              <span
                className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                  estadoClasses[impresion.estado] ||
                  'bg-slate-100 text-slate-700'
                }`}
              >
                {impresion.estado}
              </span>
            </div>

            <div className="mt-4 grid gap-3 text-sm text-on-surface-variant sm:grid-cols-2">
              <p>
                <span className="font-semibold text-on-surface">Color 1:</span>{' '}
                {impresion.colorOpcion1}
              </p>
              <p>
                <span className="font-semibold text-on-surface">Color 2:</span>{' '}
                {impresion.colorOpcion2}
              </p>
              <p>
                <span className="font-semibold text-on-surface">Color 3:</span>{' '}
                {impresion.colorOpcion3}
              </p>
              <p>
                <span className="font-semibold text-on-surface">Creada:</span>{' '}
                {new Date(impresion.creadoEn).toLocaleString()}
              </p>
            </div>

            <p className="mt-4 text-sm text-on-surface-variant">
              {impresion.comentario}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
