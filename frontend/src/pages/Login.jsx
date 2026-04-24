import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/usuarios/login`, {
        correo: email,
        contrasena: password,
      });

      const { data } = response;
      // guardar token
      localStorage.setItem('token', data.resultadoLogin.token);

      // guardar usuario
      localStorage.setItem(
        'usuario',
        JSON.stringify(data.resultadoLogin.usuario)
      );

      // redirigir
      navigate('/home');
    } catch (error) {
      setErrorMsg(
        (error.response &&
          error.response.data &&
          error.response.data.mensaje) ||
          'Error al iniciar sesión'
      );
    } finally {
      setLoading(false);
    }
  };
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="space-y-2 block text-sm font-semibold text-on-surface-variant"
              >
                Correo electrónico
                <input
                  id="email"
                  type="email"
                  className="w-full px-4 py-3 bg-surface-container-lowest border
                  border-outline-variant/20 rounded-xl focus:ring-2
                focus:ring-primary focus:border-primary outline-none
                  transition-all placeholder:text-outline text-on-surface"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="space-y-2 block text-sm font-semibold text-on-surface-variant"
              >
                Contraseña
                <input
                  id="password"
                  type="password"
                  className="w-full px-4 py-3 bg-surface-container-lowest border
                  border-outline-variant/20 rounded-xl focus:ring-2
                focus:ring-primary focus:border-primary outline-none
                  transition-all placeholder:text-outline text-on-surface pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full p-3 rounded text-white ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary'
              }`}
            >
              {loading ? 'Cargando...' : 'Acceder'}
            </button>
          </form>
          {errorMsg && <p className="text-red-500 text-sm mt-2">{errorMsg}</p>}
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
