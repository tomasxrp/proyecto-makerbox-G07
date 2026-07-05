import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
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
            grupos: [
              {
                id: 'grupo-1',
                nombreGrupo: 'Grupo A',
              },
            ],
          },
        });
      }

      if (url.includes('/api/grupo-estudiante/grupo/grupo-1')) {
        return Promise.resolve({
          data: {
            estudiantes: [],
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

  it('renderiza cursos del profesor con solicitudes asociadas', async () => {
    render(<ProfesorView />);

    expect(
      await screen.findByRole('heading', { name: /mis cursos/i })
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

  it('permite crear cursos desde la vista profesor', async () => {
    const user = userEvent.setup();

    render(<ProfesorView />);

    await waitFor(() => {
      expect(
        screen.getByText(/sistema operativo y distribuido/i)
      ).toBeInTheDocument();
    });

    await user.type(
      screen.getByPlaceholderText(/nombre del curso/i),
      'Ingeniería de Software'
    );

    const seccionCrearCurso = screen
      .getByRole('heading', { name: /crear curso/i })
      .closest('section');
    const semestreSelect = within(seccionCrearCurso).getByRole('combobox');

    await user.selectOptions(semestreSelect, 'semestre-1');
    await user.click(screen.getByRole('button', { name: /crear curso/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/curso/crear',
        {
          nombre: 'Ingeniería de Software',
          refSemestre: 'semestre-1',
        },
        {
          headers: {
            Authorization: 'Bearer token-profesor',
          },
        }
      );
    });
  });

  it('permite crear un grupo para un curso', async () => {
    const user = userEvent.setup();

    render(<ProfesorView />);

    await waitFor(() => {
      expect(
        screen.getByText(/sistema operativo y distribuido/i)
      ).toBeInTheDocument();
    });

    await user.type(
      screen.getByPlaceholderText(/nombre del grupo/i),
      'Grupo B'
    );
    await user.click(screen.getByRole('button', { name: /crear grupo/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/grupo-curso/crear',
        {
          refCurso: 'curso-1',
          nombreGrupo: 'Grupo B',
        },
        {
          headers: {
            Authorization: 'Bearer token-profesor',
          },
        }
      );
    });

    expect(
      axios.get.mock.calls.some(([url]) =>
        url.includes('/api/grupo-curso/curso/curso-1')
      )
    ).toBe(true);
  });

  it('muestra las acciones para cargar CSV y ver estudiantes', async () => {
    render(<ProfesorView />);

    expect(
      await screen.findByRole('button', { name: /subir csv/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /ver estudiantes/i })
    ).toBeInTheDocument();
  });

  it('abre el modal para cargar estudiantes por CSV', async () => {
    const user = userEvent.setup();

    render(<ProfesorView />);

    await user.click(await screen.findByRole('button', { name: /subir csv/i }));

    await waitFor(() => {
      expect(document.querySelector('input[type="file"]')).toBeInTheDocument();
    });

    expect(
      await screen.findByRole('button', { name: /procesar csv/i })
    ).toBeInTheDocument();
  });

  it('carga un archivo CSV desde el modal', async () => {
    const user = userEvent.setup();

    render(<ProfesorView />);

    await user.click(await screen.findByRole('button', { name: /subir csv/i }));

    const archivo = new File(
      ['correo,nombre\njuan@utalca.cl,Juan'],
      'estudiantes.csv',
      {
        type: 'text/csv',
      }
    );

    const inputArchivo =
      screen.queryByLabelText(/haz clic para seleccionar un csv/i) ||
      document.querySelector('input[type="file"]');

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

    expect(url).toBe('http://localhost:3000/api/estudiante-curso/cargar-csv');
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
