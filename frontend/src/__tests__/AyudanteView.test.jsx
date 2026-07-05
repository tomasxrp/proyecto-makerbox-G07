import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import React from 'react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import AyudanteView from '../components/dashboard/AyudanteView';

vi.mock('axios');

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

describe('AyudanteView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'token-ayudante');

    axios.get.mockResolvedValue({
      data: {
        solicitudes: [
          {
            id: 'impresion-1',
            tipoSolicitud: 'Impresion 3D',
            nombreCurso: 'Construccion de Software',
            colorOpcion1: 'Negro',
            colorOpcion2: 'Blanco',
            colorOpcion3: 'Azul',
            comentario: 'Prueba Hito 2',
            urlModelo3d: 'https://ejemplo.com/modelo',
            urlModeloStl: 'https://ejemplo.com/modelo.stl',
            estado: 'PENDIENTE',
            creadoEn: '2026-06-10T04:26:19.882Z',
          },
        ],
      },
    });

    axios.put.mockResolvedValue({
      data: {
        mensaje: 'Estado actualizado',
      },
    });
  });

  it('renderiza las solicitudes de impresión para el ayudante', async () => {
    render(<AyudanteView />);

    expect(
      screen.getByRole('heading', { name: /solicitudes de impresión/i })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/construccion de software/i)).toBeInTheDocument();
    });

    expect(screen.getAllByText(/pendiente/i).length).toBeGreaterThan(0);
  });

  it('permite cambiar el estado de una solicitud', async () => {
    const user = userEvent.setup();

    render(<AyudanteView />);

    await waitFor(() => {
      expect(screen.getByText(/construccion de software/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /en_proceso/i }));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        `${API_URL}/api/ayudante/solicitudes/impresion-1`,
        { estado: 'EN_PROCESO' },
        {
          headers: {
            Authorization: 'Bearer token-ayudante',
          },
        }
      );
    });
  });
});
