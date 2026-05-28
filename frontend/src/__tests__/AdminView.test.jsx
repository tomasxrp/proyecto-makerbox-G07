import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminView from '../components/dashboard/AdminView';

const navigateMock = vi.hoisted(() => vi.fn());
const axiosMock = vi.hoisted(() => ({
  get: vi.fn(),
}));

vi.mock('axios', () => ({
  default: axiosMock,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe('AdminView', () => {
  beforeEach(() => {
    localStorage.clear();
    navigateMock.mockClear();
    axiosMock.get.mockClear();
  });

  it('redirects to login when there is no token', () => {
    render(<AdminView />);

    expect(navigateMock).toHaveBeenCalledWith('/login');
  });

  it('renders metrics when the API responds successfully', async () => {
    localStorage.setItem('token', 'token-123');

    axiosMock.get
      .mockResolvedValueOnce({
        data: {
          usuarios: [
            { usuarioRol: 'ADMINISTRADOR' },
            { usuarioRol: 'PROFESOR' },
            { usuarioRol: 'ESTUDIANTE' },
          ],
        },
      })
      .mockResolvedValueOnce({
        data: {
          impresiones: [{ estado: 'PENDIENTE' }, { estado: 'COMPLETADA' }],
        },
      });

    render(<AdminView />);

    expect(
      await screen.findByText(/panel administrativo/i)
    ).toBeInTheDocument();
    expect(await screen.findByText('3')).toBeInTheDocument();
    expect(screen.getByText(/usuarios totales/i)).toBeInTheDocument();
    expect(screen.getByText(/impresiones totales/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /gestionar usuarios/i })
    ).toBeInTheDocument();
  });

  it('shows an error when metric loading fails', async () => {
    localStorage.setItem('token', 'token-123');

    axiosMock.get.mockRejectedValueOnce({
      response: {
        data: {
          mensaje: 'No se pudo cargar el admin',
        },
      },
    });

    render(<AdminView />);

    expect(
      await screen.findByText(/no se pudo cargar el admin/i)
    ).toBeInTheDocument();
  });
});
