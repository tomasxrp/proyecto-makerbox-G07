import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const rolesCrear = ['ADMINISTRADOR', 'PROFESOR', 'AYUDANTE'];
const rolesEditar = [
  'ADMINISTRADOR',
  'PROFESOR',
  'AYUDANTE',
  'ESTUDIANTE',
  'SOLICITANTE',
];

const emptyForm = {
  rut: '',
  nombre: '',
  apellido: '',
  correo: '',
  contrasena: '',
  rol: 'AYUDANTE',
};

export default function UsuariosAdmin() {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [modoEdicion, setModoEdicion] = useState(false);
  const [correoOriginal, setCorreoOriginal] = useState('');
  const [form, setForm] = useState(emptyForm);

  const token = localStorage.getItem('token');
  const storedUser = JSON.parse(localStorage.getItem('usuario') || '{}');

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const cargarUsuarios = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/usuarios`, { headers });
      setUsuarios(response.data.usuarios || []);
    } catch (error) {
      setErrorMsg(
        (error.response &&
          error.response.data &&
          error.response.data.mensaje) ||
          'Error al cargar usuarios'
      );
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (storedUser.rol !== 'ADMINISTRADOR') {
      navigate('/home');
      return;
    }

    cargarUsuarios();
  }, [navigate, token, storedUser.rol, cargarUsuarios]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleBusquedaChange = (event) => {
    setBusqueda(event.target.value);
  };

  const limpiarFormulario = () => {
    setForm(emptyForm);
    setModoEdicion(false);
    setCorreoOriginal('');
  };

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const textoBusqueda = busqueda.trim().toLowerCase();

    if (!textoBusqueda) {
      return true;
    }

    const campos = [
      usuario.nombre,
      usuario.apellido,
      usuario.correo,
      usuario.rut,
      usuario.usuarioRol,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return campos.includes(textoBusqueda);
  });

  const usuarioEnEdicion = usuarios.find(
    (usuario) => usuario.correo === correoOriginal
  );

  const iniciarEdicion = (usuario) => {
    setErrorMsg('');
    setSuccessMsg('');
    setModoEdicion(true);
    setCorreoOriginal(usuario.correo);
    setForm({
      rut: usuario.rut || '',
      nombre: usuario.nombre || '',
      apellido: usuario.apellido || '',
      correo: usuario.correo || '',
      contrasena: '',
      rol: usuario.usuarioRol || 'AYUDANTE',
    });

    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      if (modoEdicion) {
        const payload = { ...form };

        if (!payload.contrasena) {
          delete payload.contrasena;
        }

        await axios.patch(
          `${API_URL}/api/usuarios/actualizar/${correoOriginal}`,
          payload,
          { headers }
        );
        setSuccessMsg('Usuario actualizado correctamente');
      } else {
        await axios.post(`${API_URL}/api/usuarios/crear`, form, { headers });
        setSuccessMsg('Usuario creado correctamente');
      }

      limpiarFormulario();
      await cargarUsuarios();
    } catch (error) {
      setErrorMsg(
        (error.response &&
          error.response.data &&
          error.response.data.mensaje) ||
          'Error al guardar usuario'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (correo) => {
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await axios.delete(`${API_URL}/api/usuarios/eliminar/${correo}`, {
        headers,
      });
      setSuccessMsg('Usuario eliminado correctamente');
      await cargarUsuarios();
    } catch (error) {
      setErrorMsg(
        (error.response &&
          error.response.data &&
          error.response.data.mensaje) ||
          'Error al eliminar usuario'
      );
    }
  };

  let textoBoton = 'Crear usuario';

  if (submitting) {
    textoBoton = 'Guardando...';
  } else if (modoEdicion) {
    textoBoton = 'Guardar cambios';
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-outline/20 bg-surface-container-lowest p-6 shadow-sm shadow-primary/5">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-on-surface-variant">
          Administración
        </p>
        <h1 className="mt-2 text-3xl font-bold text-on-surface">
          Gestión de usuarios
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">
          El administrador puede crear administradores, profesores y ayudantes.
        </p>
      </div>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-3xl border border-outline/20 bg-surface-container-lowest p-6 shadow-sm shadow-primary/5"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-on-surface">
              {modoEdicion ? 'Editar usuario' : 'Crear usuario'}
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              {modoEdicion
                ? 'Modifica los datos y guarda los cambios.'
                : 'Ingresa los datos del nuevo usuario del sistema.'}
            </p>
          </div>

          {modoEdicion && (
            <button
              type="button"
              onClick={limpiarFormulario}
              className="rounded-full border border-outline/30 px-4 py-2 text-sm font-semibold text-on-surface transition hover:bg-surface-container"
            >
              Cancelar edición
            </button>
          )}
        </div>

        {modoEdicion && usuarioEnEdicion && (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-on-surface">
            <p className="font-semibold text-primary">Editando usuario</p>
            <p className="mt-1">
              {usuarioEnEdicion.nombre} {usuarioEnEdicion.apellido} ·{' '}
              {usuarioEnEdicion.correo}
            </p>
            <p className="mt-1 text-on-surface-variant">
              Cambia los datos y pulsa Guardar cambios para aplicar la edición.
            </p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <label
            htmlFor="usuarios-rut"
            className="grid gap-2 text-sm font-semibold text-on-surface-variant"
          >
            <span>RUT</span>
            <input
              id="usuarios-rut"
              name="rut"
              value={form.rut}
              onChange={handleChange}
              className="rounded-xl border border-outline/30 bg-white px-4 py-3 text-on-surface outline-none focus:border-primary"
              type="text"
              required
            />
          </label>

          <label
            htmlFor="usuarios-nombre"
            className="grid gap-2 text-sm font-semibold text-on-surface-variant"
          >
            <span>Nombre</span>
            <input
              id="usuarios-nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className="rounded-xl border border-outline/30 bg-white px-4 py-3 text-on-surface outline-none focus:border-primary"
              type="text"
              required
            />
          </label>

          <label
            htmlFor="usuarios-apellido"
            className="grid gap-2 text-sm font-semibold text-on-surface-variant"
          >
            <span>Apellido</span>
            <input
              id="usuarios-apellido"
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              className="rounded-xl border border-outline/30 bg-white px-4 py-3 text-on-surface outline-none focus:border-primary"
              type="text"
              required
            />
          </label>

          <label
            htmlFor="usuarios-correo"
            className="grid gap-2 text-sm font-semibold text-on-surface-variant"
          >
            <span>Correo</span>
            <input
              id="usuarios-correo"
              name="correo"
              value={form.correo}
              onChange={handleChange}
              className="rounded-xl border border-outline/30 bg-white px-4 py-3 text-on-surface outline-none focus:border-primary"
              type="email"
              required
            />
          </label>

          <label
            htmlFor="usuarios-contrasena"
            className="grid gap-2 text-sm font-semibold text-on-surface-variant"
          >
            <span>
              {modoEdicion ? 'Nueva contraseña (opcional)' : 'Contraseña'}
            </span>
            <input
              id="usuarios-contrasena"
              name="contrasena"
              value={form.contrasena}
              onChange={handleChange}
              className="rounded-xl border border-outline/30 bg-white px-4 py-3 text-on-surface outline-none focus:border-primary"
              type="password"
              required={!modoEdicion}
            />
          </label>

          <label
            htmlFor="usuarios-rol"
            className="grid gap-2 text-sm font-semibold text-on-surface-variant"
          >
            <span>Rol</span>
            <select
              id="usuarios-rol"
              name="rol"
              value={form.rol}
              onChange={handleChange}
              className="rounded-xl border border-outline/30 bg-white px-4 py-3 text-on-surface outline-none focus:border-primary"
            >
              {(modoEdicion ? rolesEditar : rolesCrear).map((rol) => (
                <option key={rol} value={rol}>
                  {rol}
                </option>
              ))}
            </select>
          </label>
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
          {textoBoton}
        </button>
      </form>

      <div className="rounded-3xl border border-outline/20 bg-surface-container-lowest p-6 shadow-sm shadow-primary/5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-on-surface">
              Usuarios registrados
            </h2>
            <p className="text-sm text-on-surface-variant">
              Lista de usuarios que pueden administrar el sistema.
            </p>
          </div>
          <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            {usuariosFiltrados.length} de {usuarios.length}
          </div>
        </div>

        <div className="mb-4 grid gap-2 text-sm font-semibold text-on-surface-variant">
          <span>Buscar usuario</span>
          <input
            id="usuarios-busqueda"
            type="search"
            value={busqueda}
            onChange={handleBusquedaChange}
            placeholder="Busca por nombre, correo, RUT o rol"
            className="w-full rounded-2xl border border-outline/30 bg-white px-4 py-3 text-on-surface outline-none transition focus:border-primary"
          />
        </div>

        {loading && (
          <div className="rounded-2xl border border-outline/20 bg-surface-container-lowest p-6 text-sm text-on-surface-variant">
            Cargando usuarios...
          </div>
        )}

        {!loading && errorMsg && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {errorMsg}
          </div>
        )}

        {!loading && !errorMsg && usuarios.length === 0 && (
          <div className="rounded-2xl border border-outline/20 bg-surface-container-lowest p-6 text-sm text-on-surface-variant">
            No hay usuarios registrados.
          </div>
        )}

        {!loading &&
          !errorMsg &&
          usuarios.length > 0 &&
          usuariosFiltrados.length === 0 && (
            <div className="rounded-2xl border border-outline/20 bg-surface-container-lowest p-6 text-sm text-on-surface-variant">
              No hay usuarios que coincidan con la búsqueda.
            </div>
          )}

        <div className="grid gap-4">
          {usuariosFiltrados.map((usuario) => (
            <article
              key={usuario.correo}
              className={`rounded-2xl border p-5 transition ${
                correoOriginal === usuario.correo && modoEdicion
                  ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                  : 'border-outline/20 bg-surface-container'
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-on-surface">
                    {usuario.nombre} {usuario.apellido}
                  </h3>
                  <p className="text-sm text-on-surface-variant">
                    {usuario.correo}
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    RUT: {usuario.rut}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {correoOriginal === usuario.correo && modoEdicion && (
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                      En edición
                    </span>
                  )}
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {usuario.usuarioRol}
                  </span>
                  <button
                    type="button"
                    onClick={() => iniciarEdicion(usuario)}
                    className="rounded-full border border-outline/30 px-4 py-2 text-sm font-semibold text-on-surface transition hover:bg-surface-container"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(usuario.correo)}
                    className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
