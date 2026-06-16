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

    axios.get.mockImplementation((url) => {
      if (url === `${API_URL}/api/impresion`) {
        return Promise.resolve({
          data: {
            impresiones: [],
          },
        });
      }

      if (url === `${API_URL}/api/curso`) {
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

    await user.click(screen.getByRole('button', { name: /nueva solicitud/i }));

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByRole('combobox'), 'curso-1');
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
      expect(axios.post).toHaveBeenCalledWith(
        `${API_URL}/api/impresion/crear`,
        {
          tipoSolicitud: 'Impresion 3D',
          nombreCurso: 'Sistema Operativo y Distribuido',
          refCurso: 'curso-1',
          colorOpcion1: 'Negro',
          colorOpcion2: 'Blanco',
          colorOpcion3: 'Azul',
          urlModelo3d: 'https://ejemplo.com/modelo',
          urlModeloStl: 'https://ejemplo.com/modelo.stl',
          comentario: 'Prueba integración',
        },
        {
          headers: {
            Authorization: 'Bearer token-estudiante',
          },
        }
      );
    });
  });
});
