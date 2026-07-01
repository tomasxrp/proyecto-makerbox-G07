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

  it('no muestra el botón para crear cursos desde profesor', async () => {
    render(<ProfesorView />);

    await waitFor(() => {
      expect(
        screen.getByText(/sistema operativo y distribuido/i)
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByRole('button', { name: /nuevo curso/i })
    ).not.toBeInTheDocument();
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

    expect(screen.getByText(/archivo csv/i)).toBeInTheDocument();
    expect(
      screen.getByText(/haz clic para seleccionar un csv/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /procesar csv/i })
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
