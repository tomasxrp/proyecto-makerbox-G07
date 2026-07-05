import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import AlumnoView from '../../components/dashboard/AlumnoView';

vi.mock('axios');

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

describe('Integración frontend - flujo estudiante', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'token-estudiante');
    localStorage.setItem('usuario', JSON.stringify({ id: 'user-1' }));

    axios.get.mockImplementation((url) => {
      if (url === `${API_URL}/api/impresion`) {
        return Promise.resolve({
          data: {
            impresiones: [],
          },
        });
      }

      if (url.includes('/api/curso')) {
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

      return Promise.resolve({ data: {} });
    });

    axios.post.mockResolvedValue({
      data: {
        mensaje: 'Impresión creada con éxito',
      },
    });
  });

  it('permite crear una solicitud de impresión asociada a un curso', async () => {
    const user = userEvent.setup();

    render(<AlumnoView />);

    await screen.findByRole('button', {
      name: /crear solicitud de impresión/i,
    });

    await user.click(
      screen.getByRole('button', { name: /crear solicitud de impresión/i })
    );

    await user.type(screen.getByPlaceholderText(/color opción 1/i), 'Negro');
    await user.type(screen.getByPlaceholderText(/color opción 2/i), 'Blanco');
    await user.type(screen.getByPlaceholderText(/color opción 3/i), 'Azul');
    await user.type(
      screen.getByPlaceholderText(/url modelo 3d/i),
      'https://ejemplo.com/modelo'
    );
    await user.type(
      screen.getByPlaceholderText(/url archivo stl/i),
      'https://ejemplo.com/modelo.stl'
    );
    await user.type(
      screen.getByPlaceholderText(/comentario/i),
      'Prueba integración'
    );

    await user.click(screen.getByRole('button', { name: /enviar solicitud/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();

      const [, body, config] = axios.post.mock.calls[0];
      expect(body).toBeInstanceOf(FormData);
      expect(config).toEqual({
        headers: {
          Authorization: 'Bearer token-estudiante',
          'Content-Type': 'multipart/form-data',
        },
      });
    });
  });
});
