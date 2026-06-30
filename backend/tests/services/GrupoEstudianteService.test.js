const mockPrisma = require('../prismaMock');
const grupoEstudianteService = require('../../src/services/GrupoEstudianteService');

describe('GrupoEstudianteService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('test para asignar estudiante a grupo', () => {
    it('Deberia dar error si el rol del usuario no es correcto', async () => {
      const usuarioEstudiante = { rol: 'ESTUDIANTE' };
      await expect(
        grupoEstudianteService.asignarEstudianteAGrupo(
          usuarioEstudiante,
          'grupo-1',
          'estudiante-1'
        )
      ).rejects.toThrow('Usuario no tiene los permisos necesarios.');
    });

    it('Deberia asignar estudiante a grupo correctamente si el rol es PROFESOR', async () => {
      const usuarioProfe = { rol: 'PROFESOR' };
      const asignacionMock = {
        refGrupo: 'grupo-1',
        refEstudiante: 'estudiante-1',
      };

      mockPrisma.grupoEstudiante.create.mockResolvedValue(asignacionMock);

      const resultado = await grupoEstudianteService.asignarEstudianteAGrupo(
        usuarioProfe,
        'grupo-1',
        'estudiante-1'
      );

      expect(mockPrisma.grupoEstudiante.create).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(asignacionMock);
    });
  });

  describe('test para obtener estudiantes de un grupo', () => {
    it('Deberia retornar lista de estudiantes de un grupo', async () => {
      const mockAsignaciones = [
        { refGrupo: 'grupo-1', refEstudiante: 'estudiante-1' },
        { refGrupo: 'grupo-1', refEstudiante: 'estudiante-2' },
      ];
      mockPrisma.grupoEstudiante.findMany.mockResolvedValue(mockAsignaciones);

      const resultado =
        await grupoEstudianteService.obtenerEstudiantesPorGrupo('grupo-1');

      expect(mockPrisma.grupoEstudiante.findMany).toHaveBeenCalledTimes(1);
      expect(resultado).toHaveLength(2);
    });
  });

  describe('test para obtener grupos de un estudiante', () => {
    it('Deberia retornar lista de grupos de un estudiante', async () => {
      const mockAsignaciones = [
        { refGrupo: 'grupo-1', refEstudiante: 'estudiante-1' },
        { refGrupo: 'grupo-2', refEstudiante: 'estudiante-1' },
      ];
      mockPrisma.grupoEstudiante.findMany.mockResolvedValue(mockAsignaciones);

      const resultado =
        await grupoEstudianteService.obtenerGruposPorEstudiante('estudiante-1');

      expect(mockPrisma.grupoEstudiante.findMany).toHaveBeenCalledTimes(1);
      expect(resultado).toHaveLength(2);
    });
  });

  describe('test para eliminar asignacion', () => {
    it('Deberia dar error si el rol del usuario no es correcto', async () => {
      const usuarioEstudiante = { rol: 'ESTUDIANTE' };
      await expect(
        grupoEstudianteService.eliminarAsignacion(
          usuarioEstudiante,
          'grupo-1',
          'estudiante-1'
        )
      ).rejects.toThrow('Usuario no tiene los permisos necesarios.');
    });

    it('Deberia dar error si la asignacion no existe', async () => {
      const usuarioAdmin = { rol: 'ADMINISTRADOR' };
      mockPrisma.grupoEstudiante.findUnique.mockResolvedValue(null);

      await expect(
        grupoEstudianteService.eliminarAsignacion(
          usuarioAdmin,
          'grupo-falso',
          'estudiante-falso'
        )
      ).rejects.toThrow('La asignación no existe en la base de datos');
    });

    it('Deberia eliminar la asignacion correctamente si el rol es PROFESOR', async () => {
      const usuarioProfe = { rol: 'PROFESOR' };
      const asignacionExistente = {
        refGrupo: 'grupo-1',
        refEstudiante: 'estudiante-1',
      };

      mockPrisma.grupoEstudiante.findUnique.mockResolvedValue(
        asignacionExistente
      );
      mockPrisma.grupoEstudiante.delete.mockResolvedValue(asignacionExistente);

      const resultado = await grupoEstudianteService.eliminarAsignacion(
        usuarioProfe,
        'grupo-1',
        'estudiante-1'
      );

      expect(mockPrisma.grupoEstudiante.delete).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(asignacionExistente);
    });
  });
});
