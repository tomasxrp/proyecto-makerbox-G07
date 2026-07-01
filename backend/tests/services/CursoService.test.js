const mockPrisma = require('../prismaMock');
const cursoService = require('../../src/services/CursoService');

describe('CursoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('test para curso service', () => {
    it('Deberia dar error si el rol del usuario no es correcto', async () => {
      const usuarioEstudiante = { rol: 'ESTUDIANTE' };

      await expect(
        cursoService.crearCurso(
          usuarioEstudiante,
          'Curso de Prueba',
          'semestre-1',
          'profesor-1'
        )
      ).rejects.toThrow('Solo un administrador puede crear cursos');
    });

    it('Deberia crear un curso de manera correcta si el rol es ADMINISTRADOR', async () => {
      const usuarioAdmin = { rol: 'ADMINISTRADOR' };

      const semestreMock = {
        id: 'semestre-1',
        anio: 2026,
        periodo: 1,
      };

      const profesorMock = {
        id: 'profesor-1',
        nombre: 'Maria',
        apellido: 'Torres',
        usuarioRol: 'PROFESOR',
      };

      const cursoMock = {
        id: 'curso-123',
        nombre: 'Curso de Prueba',
        refSemestre: 'semestre-1',
        refProfesor: 'profesor-1',
      };

      mockPrisma.semestre.findUnique.mockResolvedValue(semestreMock);
      mockPrisma.usuario.findUnique.mockResolvedValue(profesorMock);
      mockPrisma.curso.create.mockResolvedValue(cursoMock);

      const resultado = await cursoService.crearCurso(
        usuarioAdmin,
        'Curso de Prueba',
        'semestre-1',
        'profesor-1'
      );

      expect(mockPrisma.semestre.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'semestre-1',
        },
      });

      expect(mockPrisma.usuario.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'profesor-1',
        },
      });

      expect(mockPrisma.curso.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.curso.create).toHaveBeenCalledWith({
        data: {
          nombre: 'Curso de Prueba',
          refSemestre: 'semestre-1',
          refProfesor: 'profesor-1',
        },
      });

      expect(resultado).toEqual(cursoMock);
    });
  });

  describe('test para eliminar curso', () => {
    it('Deberia dar error si el rol del usuario no es correcto', async () => {
      const usuarioInvalido = { rol: 'SOLICITANTE' };
      await expect(
        cursoService.eliminarCurso(usuarioInvalido, 'curso-123')
      ).rejects.toThrow('Usuario no tiene los permisos necesarios.');
    });

    it('Deberia dar error si el curso no existe', async () => {
      const usuarioAdmin = { rol: 'ADMINISTRADOR' };
      mockPrisma.curso.findUnique.mockResolvedValue(null);

      await expect(
        cursoService.eliminarCurso(usuarioAdmin, 'curso-inexistente')
      ).rejects.toThrow('El curso no existe en la base de datos');
    });

    it('Deberia eliminar el curso de manera correcta si el rol es PROFESOR', async () => {
      const usuarioProfe = { rol: 'PROFESOR' };
      const cursoExistente = { id: 'curso-123', nombre: 'Curso a eliminar' };

      mockPrisma.curso.findUnique.mockResolvedValue(cursoExistente);
      mockPrisma.curso.delete.mockResolvedValue(cursoExistente);

      const resultado = await cursoService.eliminarCurso(
        usuarioProfe,
        'curso-123'
      );

      expect(mockPrisma.curso.delete).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(cursoExistente);
    });
  });

  describe('test para obtener curso', () => {
    it('Deberia retornar una lista vacia si no hay cursos', async () => {
      mockPrisma.curso.findMany.mockResolvedValue([]);
      const resultado = await cursoService.obtenerCursos();
      expect(resultado).toHaveLength(0);
    });

    it('Deberia retornar todos los cursos', async () => {
      const mockCursos = [
        { id: '1', nombre: 'Curso 1' },
        { id: '2', nombre: 'Curso 2' },
      ];
      mockPrisma.curso.findMany.mockResolvedValue(mockCursos);

      const resultado = await cursoService.obtenerCursos();

      expect(mockPrisma.curso.findMany).toHaveBeenCalledTimes(1);
      expect(resultado).toHaveLength(2);
      expect(resultado[0].nombre).toBe('Curso 1');
    });
  });

  describe('test para obtener curso por id', () => {
    it('Debería lanzar error si el curso no existe', async () => {
      mockPrisma.curso.findUnique.mockResolvedValue(null);
      await expect(cursoService.obtenerCursoPorId('id-falso')).rejects.toThrow(
        'El curso no existe en la base de datos'
      );
    });

    it('Deberia retornar el curso de manera correcta', async () => {
      const cursoMock = { id: '1', nombre: 'Curso Test' };
      mockPrisma.curso.findUnique.mockResolvedValue(cursoMock);

      const resultado = await cursoService.obtenerCursoPorId('1');
      expect(resultado).toEqual(cursoMock);
    });
  });

  describe('test para actualizar curso', () => {
    it('Deberia dar error si el rol del usuario no es correcto', async () => {
      const usuarioEstudiante = { rol: 'ESTUDIANTE' };
      await expect(
        cursoService.actualizarCurso(usuarioEstudiante, '1', {
          nombre: 'Nuevo Nombre',
        })
      ).rejects.toThrow('Usuario no tiene los permisos necesarios.');
    });

    it('Deberia dar error si el curso no existe', async () => {
      const usuarioAdmin = { rol: 'ADMINISTRADOR' };
      mockPrisma.curso.findUnique.mockResolvedValue(null);

      await expect(
        cursoService.actualizarCurso(usuarioAdmin, 'id-falso', {
          nombre: 'Nuevo Nombre',
        })
      ).rejects.toThrow('El curso no existe en la base de datos');
    });

    it('Deberia actualizar el curso de manera correcta si el rol es AYUDANTE', async () => {
      const usuarioAyudante = { rol: 'AYUDANTE' };
      const cursoExistente = { id: '1', nombre: 'Viejo Nombre' };
      const cursoActualizadoMock = { id: '1', nombre: 'Nuevo Nombre' };

      mockPrisma.curso.findUnique.mockResolvedValue(cursoExistente);
      mockPrisma.curso.update.mockResolvedValue(cursoActualizadoMock);

      const resultado = await cursoService.actualizarCurso(
        usuarioAyudante,
        '1',
        { nombre: 'Nuevo Nombre' }
      );

      expect(mockPrisma.curso.update).toHaveBeenCalledTimes(1);
      expect(mockPrisma.curso.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { nombre: 'Nuevo Nombre' },
      });
      expect(resultado.mensaje).toBe('Curso actualizado con exito');
      expect(resultado.cursoActualizado.nombre).toBe('Nuevo Nombre');
    });
  });
});
