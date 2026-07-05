const mockPrisma = require('../prismaMock');

jest.mock('../../src/services/EmailService', () => ({
  enviarCorreoCambioEstadoSolicitud: jest.fn(),
}));

const {
  enviarCorreoCambioEstadoSolicitud,
} = require('../../src/services/EmailService');
const impresionService = require('../../src/services/ImpresionService');

describe('ImpresionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('cambiarEstadoImpresion', () => {
    it('debería cambiar estado y enviar correo cuando existe destinatario', async () => {
      const usuarioAyudante = { id: 'ayudante-1', rol: 'AYUDANTE' };

      mockPrisma.impresion.findUnique.mockResolvedValue({
        id: 'impresion-1',
        estado: 'PENDIENTE',
        nombreCurso: 'Curso Prueba',
        solicitanteCorreo: null,
        solicitanteNombre: null,
        estudiante: {
          nombre: 'Juan',
          correo: 'juan@alumnos.utalca.cl',
        },
      });

      mockPrisma.impresion.update.mockResolvedValue({
        id: 'impresion-1',
        estado: 'EN_PROCESO',
      });

      const resultado = await impresionService.cambiarEstadoImpresion(
        usuarioAyudante,
        'impresion-1',
        'EN_PROCESO'
      );

      expect(mockPrisma.impresion.update).toHaveBeenCalledWith({
        where: { id: 'impresion-1' },
        data: {
          estado: 'EN_PROCESO',
          refAyudante: 'ayudante-1',
        },
      });

      expect(enviarCorreoCambioEstadoSolicitud).toHaveBeenCalledWith({
        destinatario: 'juan@alumnos.utalca.cl',
        nombreDestinatario: 'Juan',
        estadoAnterior: 'PENDIENTE',
        estadoNuevo: 'EN_PROCESO',
        nombreCurso: 'Curso Prueba',
        solicitudId: 'impresion-1',
        replyTo: null,
        nombreRemitente: 'equipo docente',
      });

      expect(resultado.estado).toBe('EN_PROCESO');
    });

    it('debería lanzar error cuando estado no es válido', async () => {
      const usuarioAyudante = { id: 'ayudante-1', rol: 'AYUDANTE' };

      await expect(
        impresionService.cambiarEstadoImpresion(
          usuarioAyudante,
          'impresion-1',
          'ESTADO_INVALIDO'
        )
      ).rejects.toThrow('Estado de impresión no válido');
    });
  });
});
