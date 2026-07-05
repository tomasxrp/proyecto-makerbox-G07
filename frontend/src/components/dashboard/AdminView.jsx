import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import Table from '../ui/Table';
import EmptyState from '../ui/EmptyState';
import LoadingState from '../ui/LoadingState';
import Badge from '../ui/Badge';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const initialStats = {
  usuariosTotales: 0,
  profesores: 0,
  estudiantes: 0,
  cursos: 0,
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

const inputClassName =
  'mt-2 w-full rounded-xl border border-outline/30 bg-white p-3 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

const formatDate = (value) => {
  if (!value) {
    return 'Sin fecha';
  }

  return new Date(value).toLocaleDateString('es-CL');
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

  const [modalAbierto, setModalAbierto] = useState(null);
  const [vistaActiva, setVistaActiva] = useState('cursos');
  const [cursoDetalle, setCursoDetalle] = useState(null);

  const [profesorForm, setProfesorForm] = useState(usuarioInicial);
  const [ayudanteForm, setAyudanteForm] = useState(usuarioInicial);
  const [semestreForm, setSemestreForm] = useState(semestreInicial);
  const [cursoForm, setCursoForm] = useState(cursoInicial);

  const token = localStorage.getItem('token');

  const profesores = useMemo(
    () => usuarios.filter((usuario) => usuario.usuarioRol === 'PROFESOR'),
    [usuarios]
  );

  const cards = useMemo(
    () => [
      {
        title: 'Usuarios',
        value: stats.usuariosTotales,
        description: 'Cuentas registradas',
      },
      {
        title: 'Profesores',
        value: stats.profesores,
        description: 'Docentes disponibles',
      },
      {
        title: 'Estudiantes',
        value: stats.estudiantes,
        description: 'Usuarios académicos',
      },
      {
        title: 'Cursos',
        value: stats.cursos,
        description: 'Cursos creados',
      },
    ],
    [stats]
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

      setStats({
        usuariosTotales: usuariosBackend.length,
        profesores: conteoUsuariosPorRol.PROFESOR || 0,
        estudiantes: conteoUsuariosPorRol.ESTUDIANTE || 0,
        cursos: cursosBackend.length,
      });
    } catch (error) {
      setErrorMsg(
        error.response?.data?.mensaje || 'Error al cargar datos del admin'
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

  const cerrarModal = () => {
    if (accionLoading) {
      return;
    }

    setModalAbierto(null);
    setCursoDetalle(null);
  };

  const abrirModal = (tipo, detalle = null) => {
    limpiarMensajes();
    setCursoDetalle(detalle);
    setModalAbierto(tipo);
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

      setModalAbierto(null);
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
      setModalAbierto(null);
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
      setModalAbierto(null);
      await cargarDatos();
    } catch (error) {
      setErrorAccion(error.response?.data?.mensaje || 'Error al crear curso');
    } finally {
      setAccionLoading('');
    }
  };

  const tablaCursosColumns = useMemo(
    () => [
      {
        key: 'nombre',
        label: 'Curso',
        render: (curso) => (
          <span className="font-semibold text-on-surface">{curso.nombre}</span>
        ),
      },
      {
        key: 'profesor',
        label: 'Profesor',
        render: (curso) =>
          curso.profesor
            ? `${curso.profesor.nombre} ${curso.profesor.apellido}`
            : 'Sin profesor',
      },
      {
        key: 'semestre',
        label: 'Semestre',
        render: (curso) =>
          curso.semestre
            ? `${curso.semestre.anio} - Periodo ${curso.semestre.periodo}`
            : 'Sin semestre',
      },
      {
        key: 'estado',
        label: 'Estado',
        render: () => <Badge tone="success">Activo</Badge>,
      },
      {
        key: 'acciones',
        label: 'Acciones',
        render: (curso) => (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setMensajeAccion('');
              setErrorAccion('');
              setCursoDetalle(curso);
              setModalAbierto('detalle-curso');
            }}
          >
            Ver detalles
          </Button>
        ),
      },
    ],
    []
  );

  const tablaProfesoresColumns = useMemo(
    () => [
      {
        key: 'nombre',
        label: 'Profesor',
        render: (profesor) => (
          <span className="font-semibold text-on-surface">
            {profesor.nombre} {profesor.apellido}
          </span>
        ),
      },
      {
        key: 'correo',
        label: 'Correo',
      },
      {
        key: 'rut',
        label: 'RUT',
      },
      {
        key: 'usuarioRol',
        label: 'Rol',
        render: () => <Badge tone="info">PROFESOR</Badge>,
      },
    ],
    []
  );

  const tablaSemestresColumns = useMemo(
    () => [
      {
        key: 'anio',
        label: 'Año',
      },
      {
        key: 'periodo',
        label: 'Periodo',
      },
      {
        key: 'fechaInicio',
        label: 'Inicio',
        render: (semestre) => formatDate(semestre.fechaInicio),
      },
      {
        key: 'fechaFin',
        label: 'Fin',
        render: (semestre) => formatDate(semestre.fechaFin),
      },
      {
        key: 'estado',
        label: 'Estado',
        render: (semestre) => (
          <Badge tone={semestre.estado === 'ACTIVO' ? 'success' : 'neutral'}>
            {semestre.estado}
          </Badge>
        ),
      },
    ],
    []
  );

  const renderUsuarioModal = (rol) => {
    const esProfesor = rol === 'PROFESOR';
    const form = esProfesor ? profesorForm : ayudanteForm;
    const setForm = esProfesor ? setProfesorForm : setAyudanteForm;

    const prefijo = esProfesor ? 'profesor' : 'ayudante';
    const titulo = esProfesor ? 'Crear profesor' : 'Crear ayudante global';

    return (
      <form
        onSubmit={(event) => crearUsuarioInterno(event, rol)}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label htmlFor={`${prefijo}-rut`} className="text-sm font-semibold">
            RUT
            <input
              id={`${prefijo}-rut`}
              value={form.rut}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, rut: event.target.value }))
              }
              className={inputClassName}
              placeholder="12345678-9"
              required
            />
          </label>

          <label
            htmlFor={`${prefijo}-correo`}
            className="text-sm font-semibold"
          >
            Correo
            <input
              id={`${prefijo}-correo`}
              type="email"
              value={form.correo}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, correo: event.target.value }))
              }
              className={inputClassName}
              placeholder={
                esProfesor ? 'profesor@utalca.cl' : 'ayudante@utalca.cl'
              }
              required
            />
          </label>

          <label
            htmlFor={`${prefijo}-nombre`}
            className="text-sm font-semibold"
          >
            Nombre
            <input
              id={`${prefijo}-nombre`}
              value={form.nombre}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, nombre: event.target.value }))
              }
              className={inputClassName}
              placeholder={esProfesor ? 'Carlos' : 'Ayudante'}
              required
            />
          </label>

          <label
            htmlFor={`${prefijo}-apellido`}
            className="text-sm font-semibold"
          >
            Apellido
            <input
              id={`${prefijo}-apellido`}
              value={form.apellido}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, apellido: event.target.value }))
              }
              className={inputClassName}
              placeholder={esProfesor ? 'Valenzuela' : 'MakerBox'}
              required
            />
          </label>
        </div>

        <label
          htmlFor={`${prefijo}-contrasena`}
          className="block text-sm font-semibold"
        >
          Contraseña
          <input
            id={`${prefijo}-contrasena`}
            type="password"
            value={form.contrasena}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, contrasena: event.target.value }))
            }
            className={inputClassName}
            placeholder={esProfesor ? 'Profesor123' : 'Ayudante123'}
            required
          />
        </label>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={cerrarModal}
            disabled={Boolean(accionLoading)}
          >
            Cancelar
          </Button>
          <Button type="submit" loading={accionLoading === prefijo}>
            {accionLoading === prefijo ? 'Guardando...' : titulo}
          </Button>
        </div>
      </form>
    );
  };

  const renderSemestreModal = () => (
    <form onSubmit={crearSemestre} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label htmlFor="semestre-anio" className="text-sm font-semibold">
          Año
          <input
            id="semestre-anio"
            type="number"
            value={semestreForm.anio}
            onChange={(event) =>
              setSemestreForm((prev) => ({ ...prev, anio: event.target.value }))
            }
            className={inputClassName}
            placeholder="2026"
            required
          />
        </label>

        <label htmlFor="semestre-periodo" className="text-sm font-semibold">
          Periodo
          <select
            id="semestre-periodo"
            value={semestreForm.periodo}
            onChange={(event) =>
              setSemestreForm((prev) => ({
                ...prev,
                periodo: event.target.value,
              }))
            }
            className={inputClassName}
            required
          >
            <option value="">Seleccionar periodo</option>
            <option value="1">Periodo 1</option>
            <option value="2">Periodo 2</option>
          </select>
        </label>

        <label htmlFor="semestre-inicio" className="text-sm font-semibold">
          Fecha inicio
          <input
            id="semestre-inicio"
            type="date"
            value={semestreForm.fechaInicio}
            onChange={(event) =>
              setSemestreForm((prev) => ({
                ...prev,
                fechaInicio: event.target.value,
              }))
            }
            className={inputClassName}
            required
          />
        </label>

        <label htmlFor="semestre-fin" className="text-sm font-semibold">
          Fecha fin
          <input
            id="semestre-fin"
            type="date"
            value={semestreForm.fechaFin}
            onChange={(event) =>
              setSemestreForm((prev) => ({
                ...prev,
                fechaFin: event.target.value,
              }))
            }
            className={inputClassName}
            required
          />
        </label>
      </div>

      <label htmlFor="semestre-estado" className="block text-sm font-semibold">
        Estado
        <select
          id="semestre-estado"
          value={semestreForm.estado}
          onChange={(event) =>
            setSemestreForm((prev) => ({ ...prev, estado: event.target.value }))
          }
          className={inputClassName}
        >
          <option value="ACTIVO">ACTIVO</option>
          <option value="INACTIVO">INACTIVO</option>
        </select>
      </label>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          onClick={cerrarModal}
          disabled={Boolean(accionLoading)}
        >
          Cancelar
        </Button>
        <Button type="submit" loading={accionLoading === 'semestre'}>
          {accionLoading === 'semestre' ? 'Guardando...' : 'Crear semestre'}
        </Button>
      </div>
    </form>
  );

  const renderCursoModal = () => (
    <form onSubmit={crearCurso} className="space-y-4">
      <label htmlFor="curso-nombre" className="block text-sm font-semibold">
        Nombre del curso
        <input
          id="curso-nombre"
          value={cursoForm.nombre}
          onChange={(event) =>
            setCursoForm((prev) => ({ ...prev, nombre: event.target.value }))
          }
          className={inputClassName}
          placeholder="Construcción de Software"
          required
        />
      </label>

      <label htmlFor="curso-semestre" className="block text-sm font-semibold">
        Semestre
        <select
          id="curso-semestre"
          value={cursoForm.refSemestre}
          onChange={(event) =>
            setCursoForm((prev) => ({
              ...prev,
              refSemestre: event.target.value,
            }))
          }
          className={inputClassName}
          required
        >
          <option value="">Seleccionar semestre</option>
          {semestres.map((semestre) => (
            <option key={semestre.id} value={semestre.id}>
              {semestre.anio} - Periodo {semestre.periodo} - {semestre.estado}
            </option>
          ))}
        </select>
      </label>

      <label htmlFor="curso-profesor" className="block text-sm font-semibold">
        Profesor
        <select
          id="curso-profesor"
          value={cursoForm.refProfesor}
          onChange={(event) =>
            setCursoForm((prev) => ({
              ...prev,
              refProfesor: event.target.value,
            }))
          }
          className={inputClassName}
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

      {profesores.length === 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          Debes crear al menos un profesor para asignar cursos.
        </div>
      )}

      {semestres.length === 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          Debes crear un semestre para habilitar la creación de cursos.
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          onClick={cerrarModal}
          disabled={Boolean(accionLoading)}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={accionLoading === 'curso'}
          disabled={profesores.length === 0 || semestres.length === 0}
        >
          {accionLoading === 'curso' ? 'Guardando...' : 'Crear curso'}
        </Button>
      </div>
    </form>
  );

  const renderDetalleCurso = () => {
    if (!cursoDetalle) {
      return null;
    }

    return (
      <div className="space-y-3 text-sm">
        <p>
          <span className="font-semibold">Nombre:</span> {cursoDetalle.nombre}
        </p>
        <p>
          <span className="font-semibold">Profesor:</span>{' '}
          {cursoDetalle.profesor
            ? `${cursoDetalle.profesor.nombre} ${cursoDetalle.profesor.apellido}`
            : 'Sin profesor'}
        </p>
        <p>
          <span className="font-semibold">Semestre:</span>{' '}
          {cursoDetalle.semestre
            ? `${cursoDetalle.semestre.anio} - Periodo ${cursoDetalle.semestre.periodo}`
            : 'Sin semestre'}
        </p>
        <p>
          <span className="font-semibold">Solicitudes asociadas:</span>{' '}
          {cursoDetalle.impresions?.length || 0}
        </p>

        <div className="pt-3">
          <Button variant="outline" onClick={cerrarModal}>
            Cerrar
          </Button>
        </div>
      </div>
    );
  };

  const modalConfig = {
    profesor: {
      title: 'Crear profesor',
      description:
        'El profesor podrá recibir cursos asignados por el administrador.',
      content: renderUsuarioModal('PROFESOR'),
    },
    ayudante: {
      title: 'Crear ayudante global',
      description: 'Uso temporal mientras se implementan ayudantes por curso.',
      content: renderUsuarioModal('AYUDANTE'),
    },
    semestre: {
      title: 'Crear semestre',
      description: 'Define el periodo académico donde se crearán cursos.',
      content: renderSemestreModal(),
    },
    curso: {
      title: 'Crear curso',
      description: 'Asigna un curso a un profesor dentro de un semestre.',
      content: renderCursoModal(),
    },
    'detalle-curso': {
      title: 'Detalle del curso',
      description: 'Información general del curso seleccionado.',
      content: renderDetalleCurso(),
    },
  };

  const vistaConfig = {
    cursos: {
      title: 'Cursos',
      columns: tablaCursosColumns,
      rows: cursos,
      emptyTitle: 'No hay cursos creados todavía',
      emptyDescription:
        'Crea un curso para comenzar a operar en el periodo activo.',
    },
    profesores: {
      title: 'Profesores',
      columns: tablaProfesoresColumns,
      rows: profesores,
      emptyTitle: 'No hay profesores registrados',
      emptyDescription:
        'Crea profesores desde acciones rápidas para poder asignar cursos.',
    },
    semestres: {
      title: 'Semestres',
      columns: tablaSemestresColumns,
      rows: semestres,
      emptyTitle: 'No hay semestres registrados',
      emptyDescription: 'Define un semestre antes de crear nuevos cursos.',
    },
  };

  const vistaActual = vistaConfig[vistaActiva];

  return (
    <section className="space-y-6">
      <Card className="overflow-hidden bg-gradient-to-r from-primary/10 to-white p-0">
        <div className="p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-on-surface-variant">
            Panel administrativo
          </p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-on-surface">
                Gestión general de MakerBox
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">
                Interfaz optimizada para administrar usuarios internos,
                semestres y cursos sin saturar la pantalla.
              </p>
            </div>

            <Button size="lg" onClick={() => abrirModal('curso')}>
              Crear curso
            </Button>
          </div>
        </div>
      </Card>

      {loading && <LoadingState label="Cargando panel administrativo..." />}

      {!loading && errorMsg && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {errorMsg}
        </div>
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

      {!loading && !errorMsg && (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
              <Card key={card.title} className="rounded-2xl">
                <p className="text-sm font-semibold text-on-surface-variant">
                  {card.title}
                </p>
                <p className="mt-2 text-4xl font-bold text-on-surface">
                  {card.value}
                </p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {card.description}
                </p>
              </Card>
            ))}
          </section>

          <Card
            title="Acciones rápidas"
            subtitle="Abre solo el formulario que necesitas mediante modales."
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <Button size="lg" onClick={() => abrirModal('profesor')}>
                Crear profesor
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => abrirModal('semestre')}
              >
                Crear semestre
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => abrirModal('curso')}
              >
                Crear curso
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => abrirModal('ayudante')}
              >
                Crear ayudante global
              </Button>
            </div>
          </Card>

          <Card
            title="Resumen operativo"
            subtitle="Visualiza una tabla por vez para mantener foco y claridad."
            actions={
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={vistaActiva === 'cursos' ? 'primary' : 'outline'}
                  onClick={() => setVistaActiva('cursos')}
                >
                  Cursos
                </Button>
                <Button
                  size="sm"
                  variant={vistaActiva === 'profesores' ? 'primary' : 'outline'}
                  onClick={() => setVistaActiva('profesores')}
                >
                  Profesores
                </Button>
                <Button
                  size="sm"
                  variant={vistaActiva === 'semestres' ? 'primary' : 'outline'}
                  onClick={() => setVistaActiva('semestres')}
                >
                  Semestres
                </Button>
              </div>
            }
          >
            {!vistaActual?.rows?.length ? (
              <EmptyState
                title={vistaActual.emptyTitle}
                description={vistaActual.emptyDescription}
              />
            ) : (
              <Table
                columns={vistaActual.columns}
                rows={vistaActual.rows}
                emptyTitle={vistaActual.emptyTitle}
                emptyDescription={vistaActual.emptyDescription}
              />
            )}
          </Card>
        </>
      )}

      <Modal
        open={Boolean(modalAbierto)}
        onClose={cerrarModal}
        title={modalConfig[modalAbierto]?.title || 'Gestión'}
        description={modalConfig[modalAbierto]?.description || ''}
      >
        {modalConfig[modalAbierto]?.content || null}
      </Modal>
    </section>
  );
}
