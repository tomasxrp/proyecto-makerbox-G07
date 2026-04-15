import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
  const [loading, setLoading] = useState(false);
  return (
    <main className="flex min-h-screen bg-background">
      {/* IZQUIERDA */}
      <section className="hidden lg:flex w-1/2 bg-primary text-white p-10">
        <h2 className="text-4xl font-bold">
          Precisión académica para mentes creativas
        </h2>
      </section>

      {/* DERECHA */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-on-surface mb-4">
            Iniciar sesión
          </h1>

          <div class="space-y-2">
            <label
              class="text-sm font-semibold text-on-surface-variant flex items-center gap-2"
              for="email"
            >
              Correo electrónico
            </label>
            <div class="relative">
              <input
                class="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-outline text-on-surface"
                id="email"
                placeholder="usuario@universidad.edu"
                required=""
                type="email"
              />
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label
                class="text-sm font-semibold text-on-surface-variant flex items-center gap-2"
                for="password"
              >
                Contraseña
              </label>
            </div>
            <div class="relative">
              <input
                class="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-outline text-on-surface pr-12"
                id="password"
                placeholder="••••••••"
                required=""
                type="password"
              />
              <button
                class="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                type="button"
              ></button>
            </div>
          </div>

          <button
            disabled={loading}
            className={`w-full p-3 rounded text-white ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary'
            }`}
          >
            {loading ? 'Cargando...' : 'Acceder'}
          </button>
          <p className="mt-6 text-center text-sm text-on-surface-variant">
            ¿No tienes cuenta?{' '}
            <Link
              to="/register"
              className="text-primary font-bold hover:underline transition"
            >
              Crear una ahora
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
