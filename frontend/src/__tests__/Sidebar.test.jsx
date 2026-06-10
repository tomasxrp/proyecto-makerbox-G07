import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Sidebar from '../components/Sidebar';

const renderSidebar = (role, onClose = vi.fn()) => {
  localStorage.setItem('usuario', JSON.stringify({ rol: role }));

  return render(
    <MemoryRouter>
      <Sidebar isOpen onClose={onClose} />
    </MemoryRouter>
  );
};

describe('Sidebar', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the admin links', () => {
    renderSidebar('ADMINISTRADOR');

    expect(screen.getByRole('link', { name: /inicio/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /reportes/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /cursos/i })).toBeNull();
  });

  it('renders the professor links', () => {
    renderSidebar('PROFESOR');

    expect(screen.getByRole('link', { name: /cursos/i })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /proyectos/i })
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /reportes/i })).toBeNull();
  });

  it('renders the student links and closes when requested', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    renderSidebar('ESTUDIANTE', onClose);

    expect(
      screen.getByRole('link', { name: /mis proyectos/i })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cerrar sidebar/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
