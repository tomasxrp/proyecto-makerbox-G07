import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Register from '../pages/Register';

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

describe('Register', () => {
  beforeEach(() => {
    navigateMock.mockClear();
    axiosMock.post.mockClear();
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('rejects mismatched passwords', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/^rut$/i), '12.345.678-9');
    await user.type(screen.getByLabelText(/^nombre$/i), 'Camila');
    await user.type(screen.getByLabelText(/^apellido$/i), 'Pérez');
    await user.type(
      screen.getByLabelText(/correo electrónico/i),
      'camila@makerbox.cl'
    );
    await user.type(screen.getByLabelText(/^contraseña$/i), 'clave123');
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'clave456');

    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

    expect(
      await screen.findByText(/las contraseñas no coinciden/i)
    ).toBeInTheDocument();
    expect(axiosMock.post).not.toHaveBeenCalled();
  });

  it('creates the user and redirects to login', async () => {
    axiosMock.post.mockResolvedValueOnce({ data: {} });

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/^rut$/i), '12.345.678-9');
    await user.type(screen.getByLabelText(/^nombre$/i), 'Camila');
    await user.type(screen.getByLabelText(/^apellido$/i), 'Pérez');
    await user.type(
      screen.getByLabelText(/correo electrónico/i),
      'camila@makerbox.cl'
    );
    await user.type(screen.getByLabelText(/^contraseña$/i), 'clave123');
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'clave123');

    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

    expect(
      await screen.findByText(/usuario registrado correctamente/i)
    ).toBeInTheDocument();

    await new Promise((resolve) => {
      setTimeout(resolve, 1100);
    });
    expect(navigateMock).toHaveBeenCalledWith('/login');
  });
});
