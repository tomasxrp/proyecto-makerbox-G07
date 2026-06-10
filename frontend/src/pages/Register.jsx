import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    rut: '',
    nombre: '',
    apellido: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
    rol: 'ESTUDIANTE',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (form.contrasena !== form.confirmarContrasena) {
      setErrorMsg('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_URL}/api/usuarios/registro`, {
        rut: form.rut,
        nombre: form.nombre,
        apellido: form.apellido,
        correo: form.correo,
        contrasena: form.contrasena,
        rol: form.rol,
      });

      setSuccessMsg('Usuario registrado correctamente');

      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (error) {
      setErrorMsg(
        (error.response &&
          error.response.data &&
          error.response.data.mensaje) ||
          'Error al registrar usuario'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-surface p-6 rounded shadow space-y-4"
      >
        <h1 className="text-2xl font-bold mb-4">Registro</h1>

        <div className="space-y-1.5">
          <label htmlFor="rut" className="block text-sm font-semibold">
            RUT
            <input
              id="rut"
              name="rut"
              type="text"
              value={form.rut}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border"
              required
            />
          </label>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="nombre" className="block text-sm font-semibold">
            Nombre
            <input
              id="nombre"
              name="nombre"
              type="text"
              value={form.nombre}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border"
              required
            />
          </label>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="apellido" className="block text-sm font-semibold">
            Apellido
            <input
              id="apellido"
              name="apellido"
              type="text"
              value={form.apellido}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border"
              required
            />
          </label>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="correo" className="block text-sm font-semibold">
            Correo Electrónico
            <input
              id="correo"
              name="correo"
              type="email"
              value={form.correo}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border"
              required
            />
          </label>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="contrasena" className="block text-sm font-semibold">
            Contraseña
            <input
              id="contrasena"
              name="contrasena"
              type="password"
              value={form.contrasena}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border"
              required
            />
          </label>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="confirmarContrasena"
            className="block text-sm font-semibold"
          >
            Confirmar Contraseña
            <input
              id="confirmarContrasena"
              name="confirmarContrasena"
              type="password"
              value={form.confirmarContrasena}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border"
              required
            />
          </label>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="rol" className="block text-sm font-semibold">
            Rol
            <select
              id="rol"
              name="rol"
              value={form.rol}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border"
              required
            >
              <option value="ESTUDIANTE">Estudiante</option>
              <option value="SOLICITANTE">Solicitante</option>
            </select>
          </label>
        </div>

        {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
        {successMsg && <p className="text-green-600 text-sm">{successMsg}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`w-full p-3 rounded text-white ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary'
          }`}
        >
          {loading ? 'Registrando...' : 'Crear cuenta'}
        </button>

        <p className="text-center text-sm">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-primary font-bold">
            Inicia sesión
          </Link>
        </p>
      </form>
    </main>
  );
}
