const mockPrisma = require('../prismaMock');
const estudianteCursoService = require('../../src/services/EstudianteCursoService');

describe('EstudianteCursoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('test para asignar estudiante a curso', () => {
    it('Deberia dar error si el rol del usuario no es correcto', async () => {
      const usuarioEstudiante = { rol: 'ESTUDIANTE' };
      await expect(
        estudianteCursoService.asignarEstudianteACurso(
          usuarioEstudiante,
          'curso-1',
          'estudiante-1'
        )
      ).rejects.toThrow('Usuario no tiene los permisos necesarios.');
    });

    it('Deberia asignar estudiante a curso correctamente si el rol es PROFESOR', async () => {
      const usuarioProfe = { rol: 'PROFESOR' };
      const asignacionMock = {
        refCurso: 'curso-1',
        refEstudiante: 'estudiante-1',
      };

      mockPrisma.estudianteCurso.create.mockResolvedValue(asignacionMock);

      const resultado = await estudianteCursoService.asignarEstudianteACurso(
        usuarioProfe,
        'curso-1',
        'estudiante-1'
      );

      expect(mockPrisma.estudianteCurso.create).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(asignacionMock);
    });
  });

  describe('test para obtener estudiantes de un curso', () => {
    it('Deberia retornar lista de estudiantes de un curso', async () => {
      const mockAsignaciones = [
        { refCurso: 'curso-1', refEstudiante: 'estudiante-1' },
        { refCurso: 'curso-1', refEstudiante: 'estudiante-2' },
      ];
      mockPrisma.estudianteCurso.findMany.mockResolvedValue(mockAsignaciones);

      const resultado =
        await estudianteCursoService.obtenerEstudiantesPorCurso('curso-1');

      expect(mockPrisma.estudianteCurso.findMany).toHaveBeenCalledTimes(1);
      expect(resultado).toHaveLength(2);
    });
  });

  describe('test para obtener cursos de un estudiante', () => {
    it('Deberia retornar lista de cursos de un estudiante', async () => {
      const mockAsignaciones = [
        { refCurso: 'curso-1', refEstudiante: 'estudiante-1' },
        { refCurso: 'curso-2', refEstudiante: 'estudiante-1' },
      ];
      mockPrisma.estudianteCurso.findMany.mockResolvedValue(mockAsignaciones);

      const resultado =
        await estudianteCursoService.obtenerCursosPorEstudiante('estudiante-1');

      expect(mockPrisma.estudianteCurso.findMany).toHaveBeenCalledTimes(1);
      expect(resultado).toHaveLength(2);
    });
  });

  describe('test para eliminar asignacion', () => {
    it('Deberia dar error si el rol del usuario no es correcto', async () => {
      const usuarioEstudiante = { rol: 'ESTUDIANTE' };
      await expect(
        estudianteCursoService.eliminarAsignacion(
          usuarioEstudiante,
          'curso-1',
          'estudiante-1'
        )
      ).rejects.toThrow('Usuario no tiene los permisos necesarios.');
    });

    it('Deberia dar error si la asignacion no existe', async () => {
      const usuarioAdmin = { rol: 'ADMINISTRADOR' };
      mockPrisma.estudianteCurso.findUnique.mockResolvedValue(null);

      await expect(
        estudianteCursoService.eliminarAsignacion(
          usuarioAdmin,
          'curso-falso',
          'estudiante-falso'
        )
      ).rejects.toThrow('La asignación no existe en la base de datos');
    });

    it('Deberia eliminar la asignacion correctamente si el rol es PROFESOR', async () => {
      const usuarioProfe = { rol: 'PROFESOR' };
      const asignacionExistente = {
        refCurso: 'curso-1',
        refEstudiante: 'estudiante-1',
      };

      mockPrisma.estudianteCurso.findUnique.mockResolvedValue(
        asignacionExistente
      );
      mockPrisma.estudianteCurso.delete.mockResolvedValue(asignacionExistente);

      const resultado = await estudianteCursoService.eliminarAsignacion(
        usuarioProfe,
        'curso-1',
        'estudiante-1'
      );

      expect(mockPrisma.estudianteCurso.delete).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(asignacionExistente);
    });
  });
});
