import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Home from '../pages/Home';

const navigateMock = vi.hoisted(() => vi.fn());

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
  });

  it('renders the student dashboard view', () => {
    localStorage.setItem('token', 'token-123');
    localStorage.setItem(
      'usuario',
      JSON.stringify({
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
    expect(
      screen.getByRole('heading', { name: /mis proyectos/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/72% completado/i)).toBeInTheDocument();
  });

  it('clears the session when logout is clicked', async () => {
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

    render(<Home />);

    await user.click(screen.getByRole('button', { name: /último acceso/i }));

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('usuario')).toBeNull();
    expect(localStorage.getItem('ultimoAcceso')).toBeNull();
    expect(navigateMock).toHaveBeenCalledWith('/login');
  });
});
