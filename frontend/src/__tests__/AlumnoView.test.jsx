import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import React from 'react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import AlumnoView from '../components/dashboard/AlumnoView';

vi.mock('axios');

describe('AlumnoView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'token-123');

    axios.get.mockResolvedValue({
      data: {
        impresiones: [],
      },
    });
  });

  it('renderiza la vista de solicitudes del estudiante', async () => {
    render(<AlumnoView />);

    expect(
      screen.getByRole('heading', { name: /mis solicitudes de impresión/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /nueva solicitud/i })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  it('abre la modal para crear una nueva solicitud', async () => {
    const user = userEvent.setup();

    render(<AlumnoView />);

    await user.click(screen.getByRole('button', { name: /nueva solicitud/i }));

    expect(
      screen.getByRole('heading', {
        name: /solicitar impresión 3d/i,
      })
    ).toBeInTheDocument();

    expect(screen.getByText(/seleccionar curso/i)).toBeInTheDocument();

    expect(screen.getByPlaceholderText(/url archivo stl/i)).toBeInTheDocument();
  });
});
