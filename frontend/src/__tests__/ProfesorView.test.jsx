import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import ProfesorView from '../components/dashboard/ProfesorView';

vi.mock('axios');

describe('ProfesorView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'token-profesor');
    localStorage.setItem(
      'usuario',
      JSON.stringify({
        id: 'profesor-1',
        nombre: 'Maria',
        apellido: 'Torres',
        correo: 'mtorres@utalca.cl',
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
                    comentario: 'Prueba de impresión',
                    colorOpcion1: 'Negro',
                    colorOpcion2: 'Blanco',
                    colorOpcion3: 'Azul',
                    urlModelo3d: 'https://ejemplo.com/modelo',
                    urlModeloStl: 'https://ejemplo.com/modelo.stl',
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

  it('renderiza cursos del profesor con solicitudes asociadas', async () => {
    render(<ProfesorView />);

    expect(
      screen.getByRole('heading', { name: /mis cursos/i })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText(/sistema operativo y distribuido/i)
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/semestre: 2026 - periodo 1/i)).toBeInTheDocument();
    expect(screen.getByText(/profesor: maria torres/i)).toBeInTheDocument();
    expect(screen.getByText(/prueba de impresión/i)).toBeInTheDocument();
    expect(screen.getAllByText(/pendiente/i).length).toBeGreaterThan(0);
  });

  it('abre la modal para crear un nuevo curso', async () => {
    const user = userEvent.setup();

    render(<ProfesorView />);

    await user.click(screen.getByRole('button', { name: /nuevo curso/i }));

    expect(
      screen.getByRole('heading', { name: /crear nuevo curso/i })
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/nombre del curso/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/seleccionar semestre/i)).toBeInTheDocument();
  });

  it('crea un curso desde la modal', async () => {
    const user = userEvent.setup();

    render(<ProfesorView />);

    await user.click(screen.getByRole('button', { name: /nuevo curso/i }));

    await user.type(
      screen.getByPlaceholderText(/nombre del curso/i),
      'Construccion de Software'
    );

    await user.selectOptions(screen.getByRole('combobox'), 'semestre-1');

    await user.click(screen.getByRole('button', { name: /^crear curso$/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/curso/crear',
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
});
