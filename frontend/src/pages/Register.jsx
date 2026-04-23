import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({
    nombreCompleto: '',
    correo: '',
    contraseña: '',
    confirmoContraseña: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.nombreCompleto ||
      !form.correo ||
      !form.contraseña ||
      !form.confirmoContraseña
    ) {
      return;
    }

    if (form.contraseña !== form.confirmoContraseña) {
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-surface p-6 rounded shadow space-y-4"
      >
        <h1 className="text-2xl font-bold mb-4">Registro</h1>

        {/* NOMBRE */}
        <div className="space-y-1.5">
          <label
            htmlFor="nombreCompleto"
            className="block text-sm font-semibold"
          >
            Nombre Completo
            <input
              id="nombreCompleto"
              name="nombreCompleto"
              type="text"
              value={form.nombreCompleto}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border"
              required
            />
          </label>
        </div>

        {/* EMAIL */}
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

        {/* PASSWORD */}
        <div className="space-y-1.5">
          <label htmlFor="contraseña" className="block text-sm font-semibold">
            Contraseña
            <input
              id="contraseña"
              name="contraseña"
              type="password"
              value={form.contraseña}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border"
              required
            />
          </label>
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="space-y-1.5">
          <label
            htmlFor="confirmoContraseña"
            className="block text-sm font-semibold"
          >
            Confirmar Contraseña
            <input
              id="confirmoContraseña"
              name="confirmoContraseña"
              type="password"
              value={form.confirmoContraseña}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border"
              required
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full p-3 rounded text-white ${
            loading ? 'bg-gray-400' : 'bg-primary'
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
