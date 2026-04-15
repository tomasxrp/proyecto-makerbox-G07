import { useEffect, useState } from 'react';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

function App() {
  const getPage = () =>
    window.location.hash === '#register' ? 'register' : 'login';
  const [page, setPage] = useState(getPage);

  useEffect(() => {
    const handleHashChange = () => setPage(getPage());

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return page === 'register' ? <Register /> : <Login />;
}

export default App;
