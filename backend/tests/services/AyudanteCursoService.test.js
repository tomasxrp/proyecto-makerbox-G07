const mockPrisma = require('../prismaMock');

jest.mock('../../src/services/EmailService', () => ({
  enviarCorreoCambioEstadoSolicitud: jest.fn(),
}));

const {
  enviarCorreoCambioEstadoSolicitud,
} = require('../../src/services/EmailService');
const ayudanteCursoService = require('../../src/services/AyudanteCursoService');

describe('AyudanteCursoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('actualizarSolicitud', () => {
    it('debería actualizar solicitud y enviar correo cuando cambia estado', async () => {
      const usuarioAyudanteCurso = { id: 'usuario-1', rol: 'PROFESOR' };

      mockPrisma.impresion.findUnique.mockResolvedValue({
        id: 'impresion-1',
        refCurso: 'curso-1',
        estado: 'PENDIENTE',
        nombreCurso: 'Curso 1',
        solicitanteCorreo: 'solicitante@alumnos.utalca.cl',
        solicitanteNombre: 'Camila',
        estudiante: null,
      });

      mockPrisma.cursoAyudante.findUnique.mockResolvedValue({
        id: 'asignacion-1',
        refCurso: 'curso-1',
        refUsuario: 'usuario-1',
      });

      mockPrisma.impresion.update.mockResolvedValue({
        id: 'impresion-1',
        estado: 'EN_PROCESO',
      });

      const resultado = await ayudanteCursoService.actualizarSolicitud(
        usuarioAyudanteCurso,
        'impresion-1',
        {
          estado: 'EN_PROCESO',
        }
      );

      expect(mockPrisma.impresion.update).toHaveBeenCalledWith({
        where: { id: 'impresion-1' },
        data: {
          estado: 'EN_PROCESO',
          refAyudante: 'usuario-1',
        },
      });

      expect(enviarCorreoCambioEstadoSolicitud).toHaveBeenCalledWith({
        destinatario: 'solicitante@alumnos.utalca.cl',
        nombreDestinatario: 'Camila',
        estadoAnterior: 'PENDIENTE',
        estadoNuevo: 'EN_PROCESO',
        nombreCurso: 'Curso 1',
        solicitudId: 'impresion-1',
        replyTo: null,
        nombreRemitente: 'equipo docente',
      });

      expect(resultado.estado).toBe('EN_PROCESO');
    });

    it('debería lanzar error si el usuario no puede gestionar el curso', async () => {
      const usuarioSinPermiso = { id: 'usuario-2', rol: 'PROFESOR' };

      mockPrisma.impresion.findUnique.mockResolvedValue({
        id: 'impresion-1',
        refCurso: 'curso-1',
        estado: 'PENDIENTE',
      });

      mockPrisma.cursoAyudante.findUnique.mockResolvedValue(null);

      await expect(
        ayudanteCursoService.actualizarSolicitud(
          usuarioSinPermiso,
          'impresion-1',
          {
            estado: 'EN_PROCESO',
          }
        )
      ).rejects.toThrow('No tienes permisos para gestionar esta solicitud');
    });
  });
});
