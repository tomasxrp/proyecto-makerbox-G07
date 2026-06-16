import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import ProfesorView from '../../components/dashboard/ProfesorView';

vi.mock('axios');

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

describe('Integración frontend - flujo profesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    localStorage.setItem('token', 'token-profesor');

    localStorage.setItem(
      'usuario',
      JSON.stringify({
        id: 'profesor-1',
        nombre: 'Maria',
        apellido: 'Torres',
        rol: 'PROFESOR',
      })
    );

    axios.get.mockImplementation((url) => {
      if (url.includes('/api/curso')) {
        return Promise.resolve({
          data: {
            cursos: [
              {
                id: 'curso-1',
                nombre: 'Sistema Operativo y Distribuido',
                refProfesor: 'profesor-1',
                semestre: {
                  anio: 2026,
                  periodo: 1,
                },
                profesor: {
                  nombre: 'Maria',
                  apellido: 'Torres',
                },
                impresions: [
                  {
                    id: 'impresion-1',
                    tipoSolicitud: 'Impresion 3D',
                    estado: 'PENDIENTE',
                    comentario: 'Prueba profesor',
                  },
                ],
              },
            ],
          },
        });
      }

      if (url.includes('/api/semestre')) {
        return Promise.resolve({
          data: {
            semestres: [
              {
                id: 'semestre-1',
                anio: 2026,
                periodo: 1,
              },
            ],
          },
        });
      }

      return Promise.resolve({ data: {} });
    });

    axios.post.mockResolvedValue({
      data: {
        mensaje: 'Curso creado exitosamente',
      },
    });
  });

  it('permite visualizar cursos y crear un nuevo curso', async () => {
    const user = userEvent.setup();

    render(<ProfesorView />);

    await waitFor(() => {
      expect(
        screen.getByText(/sistema operativo y distribuido/i)
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/prueba profesor/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /nuevo curso/i }));

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: /crear nuevo curso/i,
        })
      ).toBeInTheDocument();
    });

    await user.type(
      screen.getByPlaceholderText(/nombre del curso/i),
      'Construccion de Software'
    );

    await user.selectOptions(screen.getByRole('combobox'), 'semestre-1');

    await user.click(
      screen.getByRole('button', {
        name: /crear curso/i,
      })
    );

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });

    expect(axios.post).toHaveBeenCalledWith(
      `${API_URL}/api/curso/crear`,
      {
        nombre: 'Construccion de Software',
        refSemestre: 'semestre-1',
        refProfesor: 'profesor-1',
      },
      {
        headers: {
          Authorization: 'Bearer token-profesor',
        },
      }
    );
  });
});
