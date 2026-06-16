import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import AyudanteView from '../../components/dashboard/AyudanteView';

vi.mock('axios');

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

describe('Integración frontend - flujo ayudante', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'token-ayudante');

    axios.get.mockResolvedValue({
      data: {
        impresiones: [
          {
            id: 'impresion-1',
            tipoSolicitud: 'Impresion 3D',
            nombreCurso: 'Sistema Operativo y Distribuido',
            colorOpcion1: 'Negro',
            colorOpcion2: 'Blanco',
            colorOpcion3: 'Azul',
            comentario: 'Solicitud de prueba',
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
        mensaje: 'Estado de impresión actualizado exitosamente',
      },
    });
  });

  it('permite al ayudante cambiar el estado de una solicitud', async () => {
    const user = userEvent.setup();

    render(<AyudanteView />);

    await waitFor(() => {
      expect(
        screen.getByText(/sistema operativo y distribuido/i)
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /en_proceso/i }));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        `${API_URL}/api/impresion/impresion-1/estado`,
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
