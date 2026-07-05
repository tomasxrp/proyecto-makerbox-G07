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
        {
          refCurso: 'curso-1',
          refEstudiante: 'estudiante-1',
          estudiante: {
            id: 'estudiante-1',
            nombre: 'Juan',
            apellido: 'Perez',
            correo: 'juan@alumnos.utalca.cl',
          },
        },
        {
          refCurso: 'curso-1',
          refEstudiante: 'estudiante-2',
          estudiante: {
            id: 'estudiante-2',
            nombre: 'Ana',
            apellido: 'Diaz',
            correo: 'ana@alumnos.utalca.cl',
          },
        },
      ];
      const mockPendientes = [
        {
          id: 'pend-1',
          refCurso: 'curso-1',
          correo: 'nuevo@alumnos.utalca.cl',
          nombre: 'Nuevo',
          apellido: 'Alumno',
          rut: '1-9',
        },
      ];
      mockPrisma.estudianteCurso.findMany.mockResolvedValue(mockAsignaciones);
      mockPrisma.estudianteCursoPendiente.findMany.mockResolvedValue(
        mockPendientes
      );

      const resultado =
        await estudianteCursoService.obtenerEstudiantesPorCurso('curso-1');

      expect(mockPrisma.estudianteCurso.findMany).toHaveBeenCalledTimes(1);
      expect(
        mockPrisma.estudianteCursoPendiente.findMany
      ).toHaveBeenCalledTimes(1);
      expect(resultado).toHaveLength(3);
      expect(
        resultado.some((estudiante) => estudiante.esPendiente === true)
      ).toBe(true);
    });
  });

  describe('test para cargar estudiantes desde csv', () => {
    it('solo procesa correos del dominio @alumnos.utalca.cl', async () => {
      const usuarioProfe = { rol: 'PROFESOR' };
      const csv = Buffer.from(
        [
          'correo,nombre,apellido,rut',
          'valido@alumnos.utalca.cl,Valido,Alumno,11-1',
          'invalido@gmail.com,No,Valido,22-2',
        ].join('\n')
      );

      mockPrisma.curso.findUnique.mockResolvedValue({ id: 'curso-1' });
      mockPrisma.usuario.findFirst.mockResolvedValue(null);
      mockPrisma.estudianteCursoPendiente.upsert.mockResolvedValue({
        id: 'pend-1',
      });

      const resultado = await estudianteCursoService.cargarEstudiantesDesdeCsv(
        usuarioProfe,
        'curso-1',
        csv
      );

      expect(resultado.pendientes).toHaveLength(1);
      expect(resultado.noValidos).toHaveLength(1);
      expect(resultado.pendientes[0].correo).toBe('valido@alumnos.utalca.cl');
      expect(resultado.noValidos[0].correo).toBe('invalido@gmail.com');
      expect(mockPrisma.estudianteCursoPendiente.upsert).toHaveBeenCalledTimes(
        1
      );
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
