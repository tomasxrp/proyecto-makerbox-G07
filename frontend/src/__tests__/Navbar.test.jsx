import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Navbar from '../components/Navbar';

const navigateMock = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe('Navbar', () => {
  beforeEach(() => {
    localStorage.clear();
    navigateMock.mockClear();
  });

  it('shows the current user and toggles the sidebar', async () => {
    localStorage.setItem(
      'usuario',
      JSON.stringify({ nombre: 'Ana', rol: 'ESTUDIANTE' })
    );

    const toggleSidebar = vi.fn();
    const user = userEvent.setup();

    render(<Navbar onToggleSidebar={toggleSidebar} />);

    expect(screen.getByText(/ana · estudiante/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '☰' }));
    expect(toggleSidebar).toHaveBeenCalledTimes(1);
  });

  it('clears the session and redirects on logout', async () => {
    localStorage.setItem('token', 'token-123');
    localStorage.setItem(
      'usuario',
      JSON.stringify({ nombre: 'Ana', rol: 'PROFESOR' })
    );
    localStorage.setItem('ultimoAcceso', '2026-05-28T12:30:00.000Z');

    const user = userEvent.setup();

    render(<Navbar />);

    await user.click(screen.getByRole('button', { name: /cerrar sesión/i }));

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('usuario')).toBeNull();
    expect(localStorage.getItem('ultimoAcceso')).toBeNull();
    expect(navigateMock).toHaveBeenCalledWith('/login');
  });
});
