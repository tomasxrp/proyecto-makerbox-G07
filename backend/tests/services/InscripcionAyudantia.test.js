const mockPrisma = require('../prismaMock');
const inscripcionAyudantiaService = require('../../src/services/InscripcionAyudantiaService');

describe('InscripcionAyudantiaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('crearInscripcionAyudantia', () => {
    it('Debería lanzar un error si un ESTUDIANTE intenta inscribir a otra persona', async () => {
      const usuarioEstudiante = { id: 'est-1', rol: 'ESTUDIANTE' };
      const datos = {
        refAyudantia: 'ayu-1',
        refEstudiante: 'est-2',
      };

      await expect(
        inscripcionAyudantiaService.crearInscripcionAyudantia(
          usuarioEstudiante,
          datos
        )
      ).rejects.toThrow('Un estudiante solo puede inscribirse a sí mismo.');

      expect(mockPrisma.inscripcionAyudantia.create).not.toHaveBeenCalled();
    });

    it('Debería crear la inscripción exitosamente', async () => {
      const usuarioEstudiante = { id: 'est-1', rol: 'ESTUDIANTE' };
      const datos = {
        refAyudantia: 'ayu-1',
        refEstudiante: 'est-1',
      };

      const inscripcionSimulada = {
        ...datos,
        fechaInscripcion: new Date(),
        estado: 'ASISTIO',
      };

      mockPrisma.inscripcionAyudantia.create.mockResolvedValue(
        inscripcionSimulada
      );

      const resultado =
        await inscripcionAyudantiaService.crearInscripcionAyudantia(
          usuarioEstudiante,
          datos
        );

      expect(resultado).toEqual(inscripcionSimulada);
      expect(mockPrisma.inscripcionAyudantia.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('obtenerInscripcionesAyudantias', () => {
    it('Debería retornar todas las inscripciones', async () => {
      const inscripcionesMock = [
        { refAyudantia: 'ayu-1', refEstudiante: 'est-1' },
      ];
      mockPrisma.inscripcionAyudantia.findMany.mockResolvedValue(
        inscripcionesMock
      );

      const resultado =
        await inscripcionAyudantiaService.obtenerInscripcionesAyudantias();

      expect(resultado).toEqual(inscripcionesMock);
      expect(mockPrisma.inscripcionAyudantia.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('obtenerInscripcionPorId', () => {
    it('Debería lanzar un error si no encuentra la inscripción', async () => {
      mockPrisma.inscripcionAyudantia.findUnique.mockResolvedValue(null);

      await expect(
        inscripcionAyudantiaService.obtenerInscripcionPorId('ayu-1', 'est-1')
      ).rejects.toThrow('La inscripción no existe en la base de datos');
    });

    it('Debería retornar la inscripción si existe', async () => {
      const inscripcionMock = { refAyudantia: 'ayu-1', refEstudiante: 'est-1' };
      mockPrisma.inscripcionAyudantia.findUnique.mockResolvedValue(
        inscripcionMock
      );

      const resultado =
        await inscripcionAyudantiaService.obtenerInscripcionPorId(
          'ayu-1',
          'est-1'
        );

      expect(resultado).toEqual(inscripcionMock);
    });
  });

  describe('actualizarInscripcionAyudantia', () => {
    it('Debería lanzar un error si un ESTUDIANTE intenta actualizar la asistencia', async () => {
      const usuarioEstudiante = { id: 'est-1', rol: 'ESTUDIANTE' };

      await expect(
        inscripcionAyudantiaService.actualizarInscripcionAyudantia(
          usuarioEstudiante,
          'ayu-1',
          'est-1',
          { estado: 'FALTO' }
        )
      ).rejects.toThrow(
        'Usuario no tiene los permisos necesarios para modificar la asistencia.'
      );

      expect(mockPrisma.inscripcionAyudantia.update).not.toHaveBeenCalled();
    });

    it('Debería actualizar la inscripción exitosamente si es ADMIN', async () => {
      const usuarioAdmin = { rol: 'ADMINISTRADOR' };
      const inscripcionMock = {
        refAyudantia: 'ayu-1',
        refEstudiante: 'est-1',
        estado: 'ASISTIO',
      };
      const inscripcionActualizada = { ...inscripcionMock, estado: 'FALTO' };

      mockPrisma.inscripcionAyudantia.findUnique.mockResolvedValue(
        inscripcionMock
      );
      mockPrisma.inscripcionAyudantia.update.mockResolvedValue(
        inscripcionActualizada
      );

      const resultado =
        await inscripcionAyudantiaService.actualizarInscripcionAyudantia(
          usuarioAdmin,
          'ayu-1',
          'est-1',
          { estado: 'FALTO' }
        );

      expect(resultado.inscripcionActualizada.estado).toBe('FALTO');
      expect(mockPrisma.inscripcionAyudantia.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('eliminarInscripcionAyudantia', () => {
    it('Debería lanzar un error si un ESTUDIANTE intenta eliminar una inscripción que no es suya', async () => {
      const usuarioEstudiante = { id: 'est-1', rol: 'ESTUDIANTE' };

      await expect(
        inscripcionAyudantiaService.eliminarInscripcionAyudantia(
          usuarioEstudiante,
          'ayu-1',
          'est-2'
        )
      ).rejects.toThrow('No tienes permiso para eliminar esta inscripción.');
    });

    it('Debería eliminar la inscripción exitosamente si existe y tiene permisos', async () => {
      const usuarioAdmin = { rol: 'ADMINISTRADOR' };
      const inscripcionMock = { refAyudantia: 'ayu-1', refEstudiante: 'est-1' };

      mockPrisma.inscripcionAyudantia.findUnique.mockResolvedValue(
        inscripcionMock
      );
      mockPrisma.inscripcionAyudantia.delete.mockResolvedValue(inscripcionMock);

      const resultado =
        await inscripcionAyudantiaService.eliminarInscripcionAyudantia(
          usuarioAdmin,
          'ayu-1',
          'est-1'
        );

      expect(resultado).toEqual(inscripcionMock);
      expect(mockPrisma.inscripcionAyudantia.delete).toHaveBeenCalledTimes(1);
    });
  });
});
