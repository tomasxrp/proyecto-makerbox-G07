import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Login from '../pages/Login';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const navigateMock = vi.hoisted(() => vi.fn());
const axiosMock = vi.hoisted(() => ({
  post: vi.fn(),
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

describe('Login', () => {
  beforeEach(() => {
    localStorage.clear();
    navigateMock.mockClear();
    axiosMock.post.mockClear();
  });

  it('redirects if a token already exists', async () => {
    localStorage.setItem('token', 'token-123');

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(navigateMock).toHaveBeenCalledWith('/home');
  });

  it('submits credentials and stores the session', async () => {
    axiosMock.post.mockResolvedValueOnce({
      data: {
        resultadoLogin: {
          token: 'token-abc',
          usuario: {
            nombre: 'Ana',
            rol: 'ESTUDIANTE',
            correo: 'ana@makerbox.cl',
          },
        },
      },
    });

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await user.type(
      screen.getAllByLabelText(/correo electrónico/i)[0],
      'ana@makerbox.cl'
    );
    await user.type(screen.getAllByLabelText(/contraseña/i)[0], 'secreta123');
    await user.click(screen.getByRole('button', { name: /acceder/i }));

    expect(axiosMock.post).toHaveBeenCalledWith(
      `${API_URL}/api/usuarios/login`,
      {
        correo: 'ana@makerbox.cl',
        contrasena: 'secreta123',
      }
    );
    expect(localStorage.getItem('token')).toBe('token-abc');
    expect(navigateMock).toHaveBeenCalledWith('/home');
  });

  it('shows an error when login fails', async () => {
    axiosMock.post.mockRejectedValueOnce({
      response: {
        data: {
          mensaje: 'Credenciales inválidas',
        },
      },
    });

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await user.type(
      screen.getAllByLabelText(/correo electrónico/i)[0],
      'ana@makerbox.cl'
    );
    await user.type(screen.getAllByLabelText(/contraseña/i)[0], 'mala');
    await user.click(screen.getByRole('button', { name: /acceder/i }));

    expect(
      await screen.findByText(/credenciales inválidas/i)
    ).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalledWith('/home');
  });
});
