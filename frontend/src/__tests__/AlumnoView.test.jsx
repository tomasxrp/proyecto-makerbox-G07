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
    localStorage.setItem('usuario', JSON.stringify({ id: 'user-1' }));

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
  });

  it('renderiza la vista de solicitudes del estudiante', async () => {
    render(<AlumnoView />);

    expect(
      await screen.findByRole('heading', {
        name: /mis cursos/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /crear solicitud de impresión/i })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  it('abre la modal para crear una nueva solicitud', async () => {
    const user = userEvent.setup();

    render(<AlumnoView />);

    await screen.findByRole('button', {
      name: /crear solicitud de impresión/i,
    });

    await user.click(
      screen.getByRole('button', { name: /crear solicitud de impresión/i })
    );

    expect(
      screen.getByRole('heading', {
        name: /solicitar impresión 3d/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/la solicitud quedará asociada a:/i)
    ).toBeInTheDocument();

    expect(screen.getByPlaceholderText(/url archivo stl/i)).toBeInTheDocument();
  });
});
