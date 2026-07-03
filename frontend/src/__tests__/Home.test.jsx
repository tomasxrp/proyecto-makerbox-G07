import React from 'react';
import axios from 'axios';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Home from '../pages/Home';
import MainLayout from '../layouts/MainLayout';

const navigateMock = vi.hoisted(() => vi.fn());

vi.mock('axios');

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe('Home', () => {
  beforeEach(() => {
    localStorage.clear();
    navigateMock.mockClear();
    axios.get.mockResolvedValue({
      data: {
        impresiones: [],
      },
    });
  });

  it('renders the student dashboard view', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/impresion')) {
        return Promise.resolve({ data: { impresiones: [] } });
      }

      if (url.includes('/api/curso/mis-cursos')) {
        return Promise.resolve({
          data: {
            cursos: [
              {
                id: 'curso-1',
                nombre: 'Sistema Operativo y Distribuido',
              },
            ],
          },
        });
      }

      if (url.includes('/api/ayudante/')) {
        return Promise.resolve({ data: {} });
      }

      return Promise.resolve({ data: {} });
    });

    localStorage.setItem('token', 'token-123');
    localStorage.setItem(
      'usuario',
      JSON.stringify({
        id: 'user-1',
        nombre: 'Ana',
        rol: 'ESTUDIANTE',
        correo: 'ana@makerbox.cl',
      })
    );
    localStorage.setItem('ultimoAcceso', '2026-05-28T12:30:00.000Z');

    render(<Home />);

    expect(
      screen.getByRole('heading', { name: /hola, ana/i })
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /mis cursos/i })
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole('button', { name: /crear solicitud de impresión/i })
    ).toBeInTheDocument();
  });

  it('only logs out from the real logout button', async () => {
    localStorage.setItem('token', 'token-123');
    localStorage.setItem(
      'usuario',
      JSON.stringify({
        nombre: 'Ana',
        rol: 'PROFESOR',
        correo: 'ana@makerbox.cl',
      })
    );
    localStorage.setItem('ultimoAcceso', '2026-05-28T12:30:00.000Z');

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <MainLayout>
          <Home />
        </MainLayout>
      </MemoryRouter>
    );

    await user.click(screen.getByText(/última conexión:/i));

    expect(localStorage.getItem('token')).toBe('token-123');
    expect(localStorage.getItem('usuario')).not.toBeNull();
    expect(localStorage.getItem('ultimoAcceso')).not.toBeNull();

    await user.click(screen.getByRole('button', { name: /cerrar sesión/i }));

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('usuario')).toBeNull();
    expect(localStorage.getItem('ultimoAcceso')).toBeNull();
    expect(navigateMock).toHaveBeenCalledWith('/login');
  });
});
