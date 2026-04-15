import { useState } from 'react';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('student');
  const [institutionalId, setInstitutionalId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value);
  const passwordsMatch = password === confirmPassword;
  const isValid =
    fullName.trim().length > 3 &&
    isValidEmail(email) &&
    password.length >= 6 &&
    passwordsMatch &&
    termsAccepted;

  const handleRegister = (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (!isValid) {
        setError('Revisa los campos antes de continuar.');
        setLoading(false);
        return;
      }

      alert('Cuenta creada (simulada)');
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-surface font-body text-on-surface antialiased">
      <main className="relative flex min-h-screen items-center justify-center px-6 py-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(11,25,60,0.12),transparent_45%),radial-gradient(circle_at_bottom,rgba(0,107,92,0.12),transparent_35%)]" />

        <section className="relative w-full max-w-2xl rounded-4xl border border-outline-variant/20 bg-surface-container-lowest/95 p-8 shadow-[0_30px_80px_rgba(11,25,60,0.12)] backdrop-blur-xl sm:p-10">
          <div className="mb-10 flex items-center gap-3">
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
                Crear una cuenta nueva
              </p>
            </div>
          </div>

          <header className="mb-10 space-y-2 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-on-surface sm:text-4xl">
              Crear cuenta en MakerBox
            </h2>
            <p className="text-on-surface-variant">
              Únete al ecosistema de investigación y prototipado más avanzado.
            </p>
          </header>

          <form className="space-y-6" onSubmit={handleRegister}>
            <div className="space-y-1.5">
              <label
                className="px-1 text-sm font-semibold text-on-surface-variant"
                htmlFor="full_name"
              >
                Nombre Completo
              </label>
              <div className="group relative">
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="Ej. Dr. Javier Soler"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="w-full rounded-lg border-none bg-surface-container-lowest px-4 py-3 text-on-surface ring-1 ring-outline-variant/20 outline-none transition-all placeholder:text-outline focus:ring-2 focus:ring-primary"
                />
                <span className="material-symbols-outlined pointer-events-none absolute right-3 top-3.5 text-sm text-outline transition-colors group-focus-within:text-primary">
                  person
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                className="px-1 text-sm font-semibold text-on-surface-variant"
                htmlFor="email"
              >
                Correo Electrónico
              </label>
              <div className="group relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="usuario@institucion.edu"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-lg border-none bg-surface-container-lowest px-4 py-3 text-on-surface ring-1 ring-outline-variant/20 outline-none transition-all placeholder:text-outline focus:ring-2 focus:ring-primary"
                />
                <span className="material-symbols-outlined pointer-events-none absolute right-3 top-3.5 text-sm text-outline transition-colors group-focus-within:text-primary">
                  mail
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  className="px-1 text-sm font-semibold text-on-surface-variant"
                  htmlFor="role"
                >
                  Rol
                </label>
                <div className="relative">
                  <select
                    id="role"
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                    className="w-full appearance-none rounded-lg border-none bg-surface-container-lowest py-3 pl-4 pr-10 outline-none ring-1 ring-outline-variant/20 transition-all focus:ring-2 focus:ring-primary"
                  >
                    <option value="student">Estudiante</option>
                    <option value="professor">Profesor</option>
                    <option value="assistant">Asistente</option>
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute right-3 top-3.5 text-outline">
                    expand_more
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  className="px-1 text-sm font-semibold text-on-surface-variant"
                  htmlFor="id_doc"
                >
                  ID Institucional
                </label>
                <input
                  id="id_doc"
                  type="text"
                  placeholder="Opcional"
                  value={institutionalId}
                  onChange={(event) => setInstitutionalId(event.target.value)}
                  className="w-full rounded-lg border-none bg-surface-container-lowest px-4 py-3 text-on-surface ring-1 ring-outline-variant/20 outline-none transition-all placeholder:text-outline focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                className="px-1 text-sm font-semibold text-on-surface-variant"
                htmlFor="password"
              >
                Contraseña
              </label>
              <div className="group relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg border-none bg-surface-container-lowest px-4 py-3 pr-12 text-on-surface ring-1 ring-outline-variant/20 outline-none transition-all placeholder:text-outline focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3.5 text-outline transition-colors hover:text-primary"
                  onClick={() => setShowPassword((current) => !current)}
                >
                  <span className="material-symbols-outlined text-sm">
                    lock
                  </span>
                </button>
              </div>

              <div className="mt-2 flex gap-1.5 px-1">
                <div className="h-1 flex-1 rounded-full bg-secondary" />
                <div className="h-1 flex-1 rounded-full bg-secondary" />
                <div className="h-1 flex-1 rounded-full bg-surface-container-high" />
                <div className="h-1 flex-1 rounded-full bg-surface-container-high" />
                <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-secondary">
                  Segura
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                className="px-1 text-sm font-semibold text-on-surface-variant"
                htmlFor="confirm_password"
              >
                Confirmar Contraseña
              </label>
              <div className="group relative">
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-lg border-none bg-surface-container-lowest px-4 py-3 pr-12 text-on-surface ring-1 ring-outline-variant/20 outline-none transition-all placeholder:text-outline focus:ring-2 focus:ring-error"
                />
                <span className="material-symbols-outlined pointer-events-none absolute right-3 top-3.5 text-sm text-error">
                  error_outline
                </span>
              </div>
              {confirmPassword && !passwordsMatch ? (
                <p className="px-1 text-[11px] text-error">
                  Las contraseñas no coinciden.
                </p>
              ) : null}
            </div>

            <div className="flex items-start gap-3 px-1 pt-2">
              <input
                id="terms"
                type="checkbox"
                checked={termsAccepted}
                onChange={(event) => setTermsAccepted(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
              />
              <label
                className="text-xs leading-relaxed text-on-surface-variant"
                htmlFor="terms"
              >
                Acepto los{' '}
                <a className="font-bold text-primary hover:underline" href="#">
                  Términos y condiciones
                </a>{' '}
                y la{' '}
                <a className="font-bold text-primary hover:underline" href="#">
                  Política de privacidad
                </a>{' '}
                de MakerBox Research Lab.
              </label>
            </div>

            {error ? (
              <p className="text-center text-sm text-error">{error}</p>
            ) : null}

            <button
              type="submit"
              type="submit"
              disabled={!isValid || loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl py-4 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-400 disabled:shadow-none"
              style={{
                background: 'linear-gradient(135deg, #0b193c 0%, #222e52 100%)',
              }}
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          <footer className="pt-4 text-center">
            <p className="text-sm text-on-surface-variant">
              ¿Ya tienes una cuenta?{' '}
              <a
                className="font-bold text-primary hover:underline"
                href="#login"
              >
                Inicia sesión
              </a>
            </p>
          </footer>
        </section>
      </main>
    </div>
  );
}
