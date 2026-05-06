import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import MainLayout from './layouts/MainLayout';
import MisImpresiones from './pages/MisImpresiones';
import UsuariosAdmin from './pages/UsuariosAdmin';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/home"
        element={
          <MainLayout>
            <Home />
          </MainLayout>
        }
      />
      <Route
        path="/mis-impresiones"
        element={
          <MainLayout>
            <MisImpresiones />
          </MainLayout>
        }
      />
      <Route
        path="/usuarios"
        element={
          <MainLayout>
            <UsuariosAdmin />
          </MainLayout>
        }
      />
    </Routes>
  );
}
export default App;
