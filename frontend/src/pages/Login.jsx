import { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value);
  const isValid = isValidEmail(email) && password.length >= 6;

  const handleLogin = (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (email === 'test@makerbox.com' && password === '123456') {
        alert('Login exitoso (simulado)');
      } else {
        setError('Credenciales incorrectas');
      }
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-surface text-on-surface">
      <main className="relative flex min-h-screen items-center justify-center px-6 py-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(11,25,60,0.12),transparent_45%),radial-gradient(circle_at_bottom,rgba(0,107,92,0.12),transparent_35%)]" />

        <section className="relative w-full max-w-lg rounded-4xl border border-outline-variant/20 bg-surface-container-lowest/95 p-8 shadow-[0_30px_80px_rgba(11,25,60,0.12)] backdrop-blur-xl sm:p-10">
          <div className="mb-8 flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{ backgroundColor: '#0b193c' }}
            >
              <span className="material-symbols-outlined fill-icon text-white">
                precision_manufacturing
              </span>
            </div>
            <div>
              <span className="font-headline text-2xl font-black tracking-tighter text-on-surface">
                MakerBox
              </span>
              <p className="text-sm text-on-surface-variant">
                Acceso al espacio técnico
              </p>
            </div>
          </div>

          <header className="mb-10 space-y-2 text-center">
            <h1 className="text-3xl font-extrabold text-on-surface sm:text-4xl">
              Iniciar sesión en MakerBox
            </h1>
            <p className="text-on-surface-variant">
              Bienvenido de nuevo. Accede a tu espacio de trabajo técnico.
            </p>
          </header>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label
                className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant"
                htmlFor="email"
              >
                <span className="material-symbols-outlined text-sm">
                  alternate_email
                </span>
                Correo electrónico institucional
              </label>
              <input
                id="email"
                type="email"
                placeholder="usuario@universidad.edu"
                required
                className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-on-surface placeholder:text-outline outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant"
                  htmlFor="password"
                >
                  <span className="material-symbols-outlined text-sm">
                    lock
                  </span>
                  Contraseña
                </label>
                <a
                  className="text-sm font-medium text-primary transition-colors hover:underline"
                  href="#"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest py-3 pl-4 pr-12 text-on-surface placeholder:text-outline outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors hover:text-primary"
                  onClick={() => setShowPassword((current) => !current)}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                className="h-5 w-5 rounded border-outline-variant text-primary focus:ring-primary"
              />
              <label
                htmlFor="remember"
                className="cursor-pointer text-sm font-medium text-on-surface-variant"
              >
                Mantener sesión iniciada
              </label>
            </div>

            {error ? (
              <p className="text-center text-sm text-red-500">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={!isValid || loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl py-4 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-400 disabled:shadow-none"
              style={{
                background: 'linear-gradient(135deg, #0b193c 0%, #222e52 100%)',
              }}
            >
              {loading ? 'Validando...' : 'Acceder al Sistema'}
              <span className="material-symbols-outlined text-xl text-white transition-transform group-hover:translate-x-1">
                arrow_forward
              </span>
            </button>

            <div className="relative flex items-center py-4">
              <div className="grow border-t border-surface-variant" />
              <span className="mx-4 shrink text-xs font-bold uppercase tracking-widest text-outline-variant">
                O entrar con
              </span>
              <div className="grow border-t border-surface-variant" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                type="button"
                className="flex items-center justify-center gap-3 rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 font-medium text-on-surface transition-colors hover:bg-surface-container-low"
              >
                <img
                  alt="Google Logo"
                  className="h-5 w-5"
                  src="https://www.google.com/favicon.ico"
                />
                Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-3 rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 font-medium text-on-surface transition-colors hover:bg-surface-container-low"
              >
                <span className="material-symbols-outlined text-primary">
                  account_balance
                </span>
                Institucional
              </button>
            </div>

            <p className="pt-2 text-center font-medium text-on-surface-variant">
              ¿No tienes cuenta?{' '}
              <a
                className="ml-1 font-bold text-primary hover:underline"
                href="#register"
              >
                Regístrate
              </a>
            </p>

            <footer className="mt-10 flex flex-wrap justify-between gap-4 border-t border-surface-container pt-8 text-xs font-medium text-outline">
              <div className="flex gap-6">
                <a className="transition-colors hover:text-primary" href="#">
                  Términos
                </a>
                <a className="transition-colors hover:text-primary" href="#">
                  Privacidad
                </a>
                <a className="transition-colors hover:text-primary" href="#">
                  Soporte técnico
                </a>
              </div>
              <span>© 2024 MakerBox Lab</span>
            </footer>
          </form>
        </section>
      </main>

      {loading ? (
        <div className="pointer-events-none fixed bottom-8 right-8 opacity-100 transition-opacity">
          <div className="flex items-center gap-3 rounded-full bg-primary px-6 py-4 text-white shadow-2xl">
            <svg
              className="h-5 w-5 animate-spin text-secondary"
              fill="none"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                fill="currentColor"
              />
            </svg>
            <span className="text-sm font-bold">Validando credenciales...</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
