import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

const usuarioInicial = {
  rut: '',
  nombre: '',
  apellido: '',
  correo: '',
  contrasena: '',
};

const semestreInicial = {
  anio: '',
  periodo: '',
  fechaInicio: '',
  fechaFin: '',
  estado: 'ACTIVO',
};

const cursoInicial = {
  nombre: '',
  refSemestre: '',
  refProfesor: '',
};

export default function AdminView() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(initialStats);
  const [usuarios, setUsuarios] = useState([]);
  const [semestres, setSemestres] = useState([]);
  const [cursos, setCursos] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [mensajeAccion, setMensajeAccion] = useState('');
  const [errorAccion, setErrorAccion] = useState('');
  const [accionLoading, setAccionLoading] = useState('');

  const [profesorForm, setProfesorForm] = useState(usuarioInicial);
  const [ayudanteForm, setAyudanteForm] = useState(usuarioInicial);
  const [semestreForm, setSemestreForm] = useState(semestreInicial);
  const [cursoForm, setCursoForm] = useState(cursoInicial);

  const token = localStorage.getItem('token');

  const profesores = useMemo(
    () => usuarios.filter((usuario) => usuario.usuarioRol === 'PROFESOR'),
    [usuarios]
  );

  const cargarDatos = useCallback(async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    setErrorMsg('');

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [usuariosResponse, semestresResponse, cursosResponse] =
        await Promise.all([
          axios.get(`${API_URL}/api/usuarios`, { headers }),
          axios.get(`${API_URL}/api/semestre`, { headers }),
          axios.get(`${API_URL}/api/curso`, { headers }),
        ]);

      let impresiones = [];

      try {
        const impresionesResponse = await axios.get(
          `${API_URL}/api/impresion`,
          { headers }
        );

        impresiones =
          impresionesResponse.data.impresiones ||
          impresionesResponse.data.impresions ||
          [];
      } catch {
        impresiones = [];
      }

      const usuariosBackend = usuariosResponse.data.usuarios || [];
      const semestresBackend = semestresResponse.data.semestres || [];
      const cursosBackend = cursosResponse.data.cursos || [];

      setUsuarios(usuariosBackend);
      setSemestres(semestresBackend);
      setCursos(cursosBackend);

      const conteoUsuariosPorRol = {};
      usuariosBackend.forEach(({ usuarioRol }) => {
        conteoUsuariosPorRol[usuarioRol] =
          (conteoUsuariosPorRol[usuarioRol] || 0) + 1;
      });

      const conteoImpresionesPorEstado = {};
      impresiones.forEach(({ estado }) => {
        conteoImpresionesPorEstado[estado] =
          (conteoImpresionesPorEstado[estado] || 0) + 1;
      });

      setStats({
        usuariosTotales: usuariosBackend.length,
        administradores: conteoUsuariosPorRol.ADMINISTRADOR || 0,
        profesores: conteoUsuariosPorRol.PROFESOR || 0,
        ayudantes: conteoUsuariosPorRol.AYUDANTE || 0,
        estudiantes: conteoUsuariosPorRol.ESTUDIANTE || 0,
        solicitantes: conteoUsuariosPorRol.SOLICITANTE || 0,
        impresionesTotales: impresiones.length,
        impresionesPendientes: conteoImpresionesPorEstado.PENDIENTE || 0,
        impresionesEnProceso: conteoImpresionesPorEstado.EN_PROCESO || 0,
        impresionesCompletadas: conteoImpresionesPorEstado.COMPLETADA || 0,
      });
    } catch (error) {
      setErrorMsg(
        error.response?.data?.mensaje || 'Error al cargar métricas del admin'
      );
    } finally {
      setLoading(false);
    }
  }, [navigate, token]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const limpiarMensajes = () => {
    setMensajeAccion('');
    setErrorAccion('');
  };

  const crearUsuarioInterno = async (event, rol) => {
    event.preventDefault();
    limpiarMensajes();

    const form = rol === 'PROFESOR' ? profesorForm : ayudanteForm;
    const loadingKey = rol === 'PROFESOR' ? 'profesor' : 'ayudante';

    setAccionLoading(loadingKey);

    try {
      await axios.post(
        `${API_URL}/api/usuarios/admin/crear`,
        {
          ...form,
          rol,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMensajeAccion(
        rol === 'PROFESOR'
          ? 'Profesor creado exitosamente'
          : 'Ayudante creado exitosamente'
      );

      if (rol === 'PROFESOR') {
        setProfesorForm(usuarioInicial);
      } else {
        setAyudanteForm(usuarioInicial);
      }

      await cargarDatos();
    } catch (error) {
      setErrorAccion(
        error.response?.data?.mensaje || 'Error al crear usuario interno'
      );
    } finally {
      setAccionLoading('');
    }
  };

  const crearSemestre = async (event) => {
    event.preventDefault();
    limpiarMensajes();
    setAccionLoading('semestre');

    try {
      await axios.post(
        `${API_URL}/api/semestre/crear`,
        {
          anio: Number(semestreForm.anio),
          periodo: Number(semestreForm.periodo),
          fechaInicio: semestreForm.fechaInicio,
          fechaFin: semestreForm.fechaFin,
          estado: semestreForm.estado,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMensajeAccion('Semestre creado exitosamente');
      setSemestreForm(semestreInicial);
      await cargarDatos();
    } catch (error) {
      setErrorAccion(
        error.response?.data?.mensaje || 'Error al crear semestre'
      );
    } finally {
      setAccionLoading('');
    }
  };

  const crearCurso = async (event) => {
    event.preventDefault();
    limpiarMensajes();
    setAccionLoading('curso');

    try {
      await axios.post(
        `${API_URL}/api/curso/crear`,
        {
          nombre: cursoForm.nombre,
          refSemestre: cursoForm.refSemestre,
          refProfesor: cursoForm.refProfesor,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMensajeAccion('Curso creado y asignado exitosamente');
      setCursoForm(cursoInicial);
      await cargarDatos();
    } catch (error) {
      setErrorAccion(error.response?.data?.mensaje || 'Error al crear curso');
    } finally {
      setAccionLoading('');
    }
  };

  const actualizarProfesorForm = (campo, valor) => {
    setProfesorForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const actualizarAyudanteForm = (campo, valor) => {
    setAyudanteForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const actualizarSemestreForm = (campo, valor) => {
    setSemestreForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const actualizarCursoForm = (campo, valor) => {
    setCursoForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

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
      description: 'Docentes responsables de cursos',
    },
    {
      title: 'Ayudantes',
      value: stats.ayudantes,
      description: 'Usuarios con apoyo operativo general',
    },
    {
      title: 'Estudiantes',
      value: stats.estudiantes,
      description: 'Usuarios inscritos en cursos',
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
          Desde aquí puedes revisar métricas, crear usuarios internos,
          configurar semestres y asignar cursos a profesores.
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

      {(mensajeAccion || errorAccion) && (
        <div
          className={
            mensajeAccion
              ? 'rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700'
              : 'rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700'
          }
        >
          {mensajeAccion || errorAccion}
        </div>
      )}

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <article className="rounded-3xl border border-outline/20 bg-surface-container-lowest p-6 shadow-sm shadow-primary/5">
          <h2 className="text-xl font-bold text-on-surface">Crear profesor</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            El profesor podrá recibir cursos asignados por el administrador.
          </p>

          <form
            onSubmit={(event) => crearUsuarioInterno(event, 'PROFESOR')}
            className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <label
              htmlFor="profesor-rut"
              className="text-sm font-semibold text-on-surface"
            >
              RUT
              <input
                id="profesor-rut"
                value={profesorForm.rut}
                onChange={(event) =>
                  actualizarProfesorForm('rut', event.target.value)
                }
                className="mt-2 w-full rounded-lg border p-3"
                placeholder="12345678-9"
                required
              />
            </label>

            <label
              htmlFor="profesor-correo"
              className="text-sm font-semibold text-on-surface"
            >
              Correo
              <input
                id="profesor-correo"
                type="email"
                value={profesorForm.correo}
                onChange={(event) =>
                  actualizarProfesorForm('correo', event.target.value)
                }
                className="mt-2 w-full rounded-lg border p-3"
                placeholder="profesor@utalca.cl"
                required
              />
            </label>

            <label
              htmlFor="profesor-nombre"
              className="text-sm font-semibold text-on-surface"
            >
              Nombre
              <input
                id="profesor-nombre"
                value={profesorForm.nombre}
                onChange={(event) =>
                  actualizarProfesorForm('nombre', event.target.value)
                }
                className="mt-2 w-full rounded-lg border p-3"
                placeholder="Carlos"
                required
              />
            </label>

            <label
              htmlFor="profesor-apellido"
              className="text-sm font-semibold text-on-surface"
            >
              Apellido
              <input
                id="profesor-apellido"
                value={profesorForm.apellido}
                onChange={(event) =>
                  actualizarProfesorForm('apellido', event.target.value)
                }
                className="mt-2 w-full rounded-lg border p-3"
                placeholder="Valenzuela"
                required
              />
            </label>

            <label
              htmlFor="profesor-contrasena"
              className="text-sm font-semibold text-on-surface md:col-span-2"
            >
              Contraseña
              <input
                id="profesor-contrasena"
                type="password"
                value={profesorForm.contrasena}
                onChange={(event) =>
                  actualizarProfesorForm('contrasena', event.target.value)
                }
                className="mt-2 w-full rounded-lg border p-3"
                placeholder="Profesor123"
                required
              />
            </label>

            <button
              type="submit"
              disabled={accionLoading === 'profesor'}
              className="rounded-lg bg-primary px-4 py-3 font-semibold text-white transition hover:scale-[1.02] hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 md:col-span-2"
            >
              {accionLoading === 'profesor'
                ? 'Creando profesor...'
                : 'Crear profesor'}
            </button>
          </form>
        </article>

        <article className="rounded-3xl border border-outline/20 bg-surface-container-lowest p-6 shadow-sm shadow-primary/5">
          <h2 className="text-xl font-bold text-on-surface">Crear ayudante</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Crea un usuario ayudante global. Más adelante podemos reemplazarlo
            por ayudantes por curso.
          </p>

          <form
            onSubmit={(event) => crearUsuarioInterno(event, 'AYUDANTE')}
            className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <label
              htmlFor="ayudante-rut"
              className="text-sm font-semibold text-on-surface"
            >
              RUT
              <input
                id="ayudante-rut"
                value={ayudanteForm.rut}
                onChange={(event) =>
                  actualizarAyudanteForm('rut', event.target.value)
                }
                className="mt-2 w-full rounded-lg border p-3"
                placeholder="22222222-2"
                required
              />
            </label>

            <label
              htmlFor="ayudante-correo"
              className="text-sm font-semibold text-on-surface"
            >
              Correo
              <input
                id="ayudante-correo"
                type="email"
                value={ayudanteForm.correo}
                onChange={(event) =>
                  actualizarAyudanteForm('correo', event.target.value)
                }
                className="mt-2 w-full rounded-lg border p-3"
                placeholder="ayudante@utalca.cl"
                required
              />
            </label>

            <label
              htmlFor="ayudante-nombre"
              className="text-sm font-semibold text-on-surface"
            >
              Nombre
              <input
                id="ayudante-nombre"
                value={ayudanteForm.nombre}
                onChange={(event) =>
                  actualizarAyudanteForm('nombre', event.target.value)
                }
                className="mt-2 w-full rounded-lg border p-3"
                placeholder="Ayudante"
                required
              />
            </label>

            <label
              htmlFor="ayudante-apellido"
              className="text-sm font-semibold text-on-surface"
            >
              Apellido
              <input
                id="ayudante-apellido"
                value={ayudanteForm.apellido}
                onChange={(event) =>
                  actualizarAyudanteForm('apellido', event.target.value)
                }
                className="mt-2 w-full rounded-lg border p-3"
                placeholder="MakerBox"
                required
              />
            </label>

            <label
              htmlFor="ayudante-contrasena"
              className="text-sm font-semibold text-on-surface md:col-span-2"
            >
              Contraseña
              <input
                id="ayudante-contrasena"
                type="password"
                value={ayudanteForm.contrasena}
                onChange={(event) =>
                  actualizarAyudanteForm('contrasena', event.target.value)
                }
                className="mt-2 w-full rounded-lg border p-3"
                placeholder="Ayudante123"
                required
              />
            </label>

            <button
              type="submit"
              disabled={accionLoading === 'ayudante'}
              className="rounded-lg bg-primary px-4 py-3 font-semibold text-white transition hover:scale-[1.02] hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 md:col-span-2"
            >
              {accionLoading === 'ayudante'
                ? 'Creando ayudante...'
                : 'Crear ayudante'}
            </button>
          </form>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <article className="rounded-3xl border border-outline/20 bg-surface-container-lowest p-6 shadow-sm shadow-primary/5">
          <h2 className="text-xl font-bold text-on-surface">Crear semestre</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Define el periodo académico donde se crearán los cursos.
          </p>

          <form
            onSubmit={crearSemestre}
            className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <label
              htmlFor="semestre-anio"
              className="text-sm font-semibold text-on-surface"
            >
              Año
              <input
                id="semestre-anio"
                type="number"
                value={semestreForm.anio}
                onChange={(event) =>
                  actualizarSemestreForm('anio', event.target.value)
                }
                className="mt-2 w-full rounded-lg border p-3"
                placeholder="2026"
                required
              />
            </label>

            <label
              htmlFor="semestre-periodo"
              className="text-sm font-semibold text-on-surface"
            >
              Periodo
              <select
                id="semestre-periodo"
                value={semestreForm.periodo}
                onChange={(event) =>
                  actualizarSemestreForm('periodo', event.target.value)
                }
                className="mt-2 w-full rounded-lg border p-3"
                required
              >
                <option value="">Seleccionar periodo</option>
                <option value="1">Periodo 1</option>
                <option value="2">Periodo 2</option>
              </select>
            </label>

            <label
              htmlFor="semestre-inicio"
              className="text-sm font-semibold text-on-surface"
            >
              Fecha inicio
              <input
                id="semestre-inicio"
                type="date"
                value={semestreForm.fechaInicio}
                onChange={(event) =>
                  actualizarSemestreForm('fechaInicio', event.target.value)
                }
                className="mt-2 w-full rounded-lg border p-3"
                required
              />
            </label>

            <label
              htmlFor="semestre-fin"
              className="text-sm font-semibold text-on-surface"
            >
              Fecha fin
              <input
                id="semestre-fin"
                type="date"
                value={semestreForm.fechaFin}
                onChange={(event) =>
                  actualizarSemestreForm('fechaFin', event.target.value)
                }
                className="mt-2 w-full rounded-lg border p-3"
                required
              />
            </label>

            <label
              htmlFor="semestre-estado"
              className="text-sm font-semibold text-on-surface md:col-span-2"
            >
              Estado
              <select
                id="semestre-estado"
                value={semestreForm.estado}
                onChange={(event) =>
                  actualizarSemestreForm('estado', event.target.value)
                }
                className="mt-2 w-full rounded-lg border p-3"
              >
                <option value="ACTIVO">ACTIVO</option>
                <option value="INACTIVO">INACTIVO</option>
              </select>
            </label>

            <button
              type="submit"
              disabled={accionLoading === 'semestre'}
              className="rounded-lg bg-primary px-4 py-3 font-semibold text-white transition hover:scale-[1.02] hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 md:col-span-2"
            >
              {accionLoading === 'semestre'
                ? 'Creando semestre...'
                : 'Crear semestre'}
            </button>
          </form>
        </article>

        <article className="rounded-3xl border border-outline/20 bg-surface-container-lowest p-6 shadow-sm shadow-primary/5">
          <h2 className="text-xl font-bold text-on-surface">
            Crear curso y asignar profesor
          </h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            El curso quedará visible para el profesor seleccionado.
          </p>

          <form onSubmit={crearCurso} className="mt-5 grid grid-cols-1 gap-4">
            <label
              htmlFor="curso-nombre"
              className="text-sm font-semibold text-on-surface"
            >
              Nombre del curso
              <input
                id="curso-nombre"
                value={cursoForm.nombre}
                onChange={(event) =>
                  actualizarCursoForm('nombre', event.target.value)
                }
                className="mt-2 w-full rounded-lg border p-3"
                placeholder="Construcción de Software"
                required
              />
            </label>

            <label
              htmlFor="curso-semestre"
              className="text-sm font-semibold text-on-surface"
            >
              Semestre
              <select
                id="curso-semestre"
                value={cursoForm.refSemestre}
                onChange={(event) =>
                  actualizarCursoForm('refSemestre', event.target.value)
                }
                className="mt-2 w-full rounded-lg border p-3"
                required
              >
                <option value="">Seleccionar semestre</option>
                {semestres.map((semestre) => (
                  <option key={semestre.id} value={semestre.id}>
                    {semestre.anio} - Periodo {semestre.periodo} -{' '}
                    {semestre.estado}
                  </option>
                ))}
              </select>
            </label>

            <label
              htmlFor="curso-profesor"
              className="text-sm font-semibold text-on-surface"
            >
              Profesor
              <select
                id="curso-profesor"
                value={cursoForm.refProfesor}
                onChange={(event) =>
                  actualizarCursoForm('refProfesor', event.target.value)
                }
                className="mt-2 w-full rounded-lg border p-3"
                required
              >
                <option value="">Seleccionar profesor</option>
                {profesores.map((profesor) => (
                  <option key={profesor.id} value={profesor.id}>
                    {profesor.nombre} {profesor.apellido} - {profesor.correo}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="submit"
              disabled={accionLoading === 'curso'}
              className="rounded-lg bg-primary px-4 py-3 font-semibold text-white transition hover:scale-[1.02] hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            >
              {accionLoading === 'curso' ? 'Creando curso...' : 'Crear curso'}
            </button>
          </form>
        </article>
      </section>

      <section className="rounded-3xl border border-outline/20 bg-surface-container-lowest p-6 shadow-sm shadow-primary/5">
        <h2 className="text-xl font-bold text-on-surface">Cursos creados</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          Últimos cursos registrados en el sistema.
        </p>

        <div className="mt-4 space-y-3">
          {cursos.length === 0 ? (
            <p className="text-sm text-on-surface-variant">
              No hay cursos creados.
            </p>
          ) : (
            cursos.map((curso) => (
              <div
                key={curso.id}
                className="rounded-2xl border border-outline/20 p-4 text-sm"
              >
                <p className="font-semibold text-on-surface">{curso.nombre}</p>
                <p className="text-on-surface-variant">
                  Profesor: {curso.profesor?.nombre} {curso.profesor?.apellido}
                </p>
                <p className="text-on-surface-variant">
                  Semestre: {curso.semestre?.anio} - Periodo{' '}
                  {curso.semestre?.periodo}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </section>
  );
}
