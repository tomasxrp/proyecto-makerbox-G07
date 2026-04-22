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
      alert('Completa todos los campos');
      return;
    }

    if (form.contraseña !== form.confirmoContraseña) {
      alert('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      console.log('Usuario registrado:', form);
      setLoading(false);
    }, 1500);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-surface p-6 rounded shadow"
      >
        <h1 className="text-2xl font-bold mb-4">Registro</h1>

        <div class="space-y-1.5">
          <label
            class="text-sm font-semibold text-on-surface-variant px-1"
            for="full_name"
          >
            Nombre Completo
          </label>
          <div class="relative group">
            <input
              class="w-full px-4 py-3 rounded-lg bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary transition-all placeholder:text-outline outline-none"
              id="full_name"
              name="full_name"
              placeholder="Ej. Dr. Javier Soler"
              type="text"
            />
            <span class="absolute right-3 top-3.5 material-symbols-outlined text-outline text-sm group-focus-within:text-primary"></span>
          </div>
        </div>

        <div class="space-y-1.5">
          <label
            class="text-sm font-semibold text-on-surface-variant px-1"
            for="email"
          >
            Correo Electrónico
          </label>
          <div class="relative group">
            <input
              class="w-full px-4 py-3 rounded-lg bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary transition-all placeholder:text-outline outline-none"
              id="email"
              name="email"
              placeholder="usuario@institucion.edu"
              type="email"
            />
            <span
              class="absolute right-3 top-3.5 material-symbols-outlined text-outline text-sm group-focus-within:text-primary"
              data-icon="mail"
            ></span>
          </div>
        </div>
        <div class="space-y-1.5">
          <label
            class="text-sm font-semibold text-on-surface-variant px-1"
            for="password"
          >
            Contraseña
          </label>
          <div class="relative group">
            <input
              class="w-full px-4 py-3 rounded-lg bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary transition-all placeholder:text-outline outline-none"
              id="password"
              name="password"
              placeholder="••••••••"
              type="password"
            />
            <span
              class="absolute right-3 top-3.5 material-symbols-outlined text-outline text-sm group-focus-within:text-primary"
              data-icon="lock"
            ></span>
          </div>
        </div>
        <div class="space-y-1.5">
          <label
            class="text-sm font-semibold text-on-surface-variant px-1"
            for="confirm_password"
          >
            Confirmar Contraseña
          </label>
          <div class="relative group">
            <input
              class="w-full px-4 py-3 rounded-lg bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-error transition-all placeholder:text-outline outline-none"
              id="confirm_password"
              name="confirm_password"
              placeholder="••••••••"
              type="password"
            />
            <span
              class="absolute right-3 top-3.5 material-symbols-outlined text-error text-sm"
              data-icon="error_outline"
            ></span>
          </div>
          <p class="text-[11px] text-error px-1">
            Las contraseñas no coinciden.
          </p>
        </div>

        <button
          disabled={loading}
          className={`w-full p-3 rounded text-white ${
            loading ? 'bg-gray-400' : 'bg-primary'
          }`}
        >
          {loading ? 'Registrando...' : 'Crear cuenta'}
        </button>
        <p className="mt-6 text-center text-sm text-on-surface-variant">
          ¿Ya tienes cuenta?{' '}
          <Link
            to="/login"
            className="text-primary font-bold hover:underline transition"
          >
            Inicia sesión
          </Link>
        </p>
      </form>
    </main>
  );
}
