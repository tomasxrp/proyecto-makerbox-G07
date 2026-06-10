import React from 'react';
import axios from 'axios';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Home from '../pages/Home';

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
      screen.getByRole('heading', { name: /mis solicitudes de impresión/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /nueva solicitud/i })
    ).toBeInTheDocument();
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
