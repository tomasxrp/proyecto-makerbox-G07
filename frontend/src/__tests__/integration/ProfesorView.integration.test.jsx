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

      if (url.includes('/api/grupo-curso/curso/curso-1')) {
        return Promise.resolve({
          data: {
            grupos: [],
          },
        });
      }

      if (url.includes('/api/estudiante-curso/curso/curso-1')) {
        return Promise.resolve({
          data: {
            estudiantes: [
              {
                id: 'estudiante-1',
                nombre: 'Juan',
                apellido: 'Perez',
                correo: 'juan@utalca.cl',
              },
            ],
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

      return Promise.resolve({ data: {} });
    });

    axios.post.mockResolvedValue({
      data: {
        resultado: {
          asignados: [
            {
              correo: 'juan@utalca.cl',
              nombre: 'Juan',
              apellido: 'Perez',
            },
          ],
          pendientes: [],
          yaAsignados: [],
          noValidos: [],
        },
      },
    });
  });

  it('permite visualizar cursos asignados, crear curso y cargar CSV', async () => {
    const user = userEvent.setup();

    render(<ProfesorView />);

    await waitFor(() => {
      expect(
        screen.getByText(/sistema operativo y distribuido/i)
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/prueba profesor/i)).toBeInTheDocument();

    await user.type(
      screen.getByPlaceholderText(/nombre del curso/i),
      'Arquitectura de Software'
    );
    await user.selectOptions(screen.getByRole('combobox'), 'semestre-1');
    await user.click(screen.getByRole('button', { name: /crear curso/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${API_URL}/api/curso/crear`,
        {
          nombre: 'Arquitectura de Software',
          refSemestre: 'semestre-1',
        },
        {
          headers: {
            Authorization: 'Bearer token-profesor',
          },
        }
      );
    });

    await user.click(screen.getByRole('button', { name: /subir csv/i }));

    await waitFor(() => {
      expect(document.querySelector('input[type="file"]')).toBeInTheDocument();
    });

    const archivo = new File(
      ['correo,nombre\njuan@utalca.cl,Juan'],
      'estudiantes.csv',
      {
        type: 'text/csv',
      }
    );

    const inputArchivo = document.querySelector('input[type="file"]');

    await user.upload(inputArchivo, archivo);

    await user.click(screen.getByRole('button', { name: /procesar csv/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });

    const llamadaCsv = axios.post.mock.calls.find(([url]) =>
      url.includes('/api/estudiante-curso/cargar-csv')
    );

    expect(llamadaCsv).toBeTruthy();

    const [url, formData, config] = llamadaCsv;

    expect(url).toBe(`${API_URL}/api/estudiante-curso/cargar-csv`);
    expect(formData.get('refCurso')).toBe('curso-1');
    expect(formData.get('archivo')).toBe(archivo);
    expect(config).toEqual({
      headers: {
        Authorization: 'Bearer token-profesor',
        'Content-Type': 'multipart/form-data',
      },
    });
  });
});
