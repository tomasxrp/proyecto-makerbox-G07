const mockPrisma = require('../prismaMock');
const grupoCursoService = require('../../src/services/GrupoCursoService');

describe('GrupoCursoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('test para crear grupo curso', () => {
    it('Deberia dar error si el rol del usuario no es correcto', async () => {
      const usuarioEstudiante = { rol: 'ESTUDIANTE' };
      await expect(
        grupoCursoService.crearGrupo(usuarioEstudiante, 'curso-1', 'Grupo 1')
      ).rejects.toThrow('Usuario no tiene los permisos necesarios.');
    });

    it('Deberia crear el grupo correctamente si el rol es PROFESOR', async () => {
      const usuarioProfe = { rol: 'PROFESOR' };
      const grupoMock = {
        id: 'grupo-1',
        refCurso: 'curso-1',
        nombreGrupo: 'Grupo 1',
      };

      mockPrisma.grupoCurso.create.mockResolvedValue(grupoMock);

      const resultado = await grupoCursoService.crearGrupo(
        usuarioProfe,
        'curso-1',
        'Grupo 1'
      );

      expect(mockPrisma.grupoCurso.create).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(grupoMock);
    });
  });

  describe('test para obtener grupos por curso', () => {
    it('Deberia retornar una lista de grupos', async () => {
      const mockGrupos = [
        { id: 'grupo-1', refCurso: 'curso-1', nombreGrupo: 'Grupo 1' },
        { id: 'grupo-2', refCurso: 'curso-1', nombreGrupo: 'Grupo 2' },
      ];
      mockPrisma.grupoCurso.findMany.mockResolvedValue(mockGrupos);

      const resultado =
        await grupoCursoService.obtenerGruposPorCurso('curso-1');

      expect(mockPrisma.grupoCurso.findMany).toHaveBeenCalledTimes(1);
      expect(resultado).toHaveLength(2);
    });
  });

  describe('test para obtener grupo por id', () => {
    it('Deberia dar error si el grupo no existe', async () => {
      mockPrisma.grupoCurso.findUnique.mockResolvedValue(null);
      await expect(
        grupoCursoService.obtenerGrupoPorId('grupo-falso')
      ).rejects.toThrow('El grupo no existe en la base de datos');
    });

    it('Deberia retornar el grupo correctamente', async () => {
      const grupoMock = { id: 'grupo-1', nombreGrupo: 'Grupo 1' };
      mockPrisma.grupoCurso.findUnique.mockResolvedValue(grupoMock);

      const resultado = await grupoCursoService.obtenerGrupoPorId('grupo-1');
      expect(resultado).toEqual(grupoMock);
    });
  });

  describe('test para actualizar grupo', () => {
    it('Deberia dar error si el usuario no tiene permisos', async () => {
      const usuarioEstudiante = { rol: 'ESTUDIANTE' };
      await expect(
        grupoCursoService.actualizarGrupo(usuarioEstudiante, 'grupo-1', {
          nombreGrupo: 'Nuevo Nombre',
        })
      ).rejects.toThrow('Usuario no tiene los permisos necesarios.');
    });

    it('Deberia dar error si el grupo no existe', async () => {
      const usuarioProfe = { rol: 'PROFESOR' };
      mockPrisma.grupoCurso.findUnique.mockResolvedValue(null);
      await expect(
        grupoCursoService.actualizarGrupo(usuarioProfe, 'grupo-falso', {
          nombreGrupo: 'Nuevo Nombre',
        })
      ).rejects.toThrow('El grupo no existe en la base de datos');
    });

    it('Deberia actualizar el grupo correctamente si el rol es PROFESOR', async () => {
      const usuarioProfe = { rol: 'PROFESOR' };
      const grupoExistente = { id: 'grupo-1', nombreGrupo: 'Viejo Nombre' };
      const grupoActualizado = { id: 'grupo-1', nombreGrupo: 'Nuevo Nombre' };

      mockPrisma.grupoCurso.findUnique.mockResolvedValue(grupoExistente);
      mockPrisma.grupoCurso.update.mockResolvedValue(grupoActualizado);

      const resultado = await grupoCursoService.actualizarGrupo(
        usuarioProfe,
        'grupo-1',
        { nombreGrupo: 'Nuevo Nombre' }
      );

      expect(mockPrisma.grupoCurso.update).toHaveBeenCalledTimes(1);
      expect(resultado.grupoActualizado.nombreGrupo).toBe('Nuevo Nombre');
    });
  });

  describe('test para eliminar grupo', () => {
    it('Deberia dar error si el usuario no tiene permisos', async () => {
      const usuarioEstudiante = { rol: 'ESTUDIANTE' };
      await expect(
        grupoCursoService.eliminarGrupo(usuarioEstudiante, 'grupo-1')
      ).rejects.toThrow('Usuario no tiene los permisos necesarios.');
    });

    it('Deberia dar error si el grupo no existe', async () => {
      const usuarioProfe = { rol: 'PROFESOR' };
      mockPrisma.grupoCurso.findUnique.mockResolvedValue(null);
      await expect(
        grupoCursoService.eliminarGrupo(usuarioProfe, 'grupo-falso')
      ).rejects.toThrow('El grupo no existe en la base de datos');
    });

    it('Deberia eliminar el grupo correctamente si el rol es PROFESOR', async () => {
      const usuarioProfe = { rol: 'PROFESOR' };
      const grupoExistente = { id: 'grupo-1', nombreGrupo: 'Grupo 1' };

      mockPrisma.grupoCurso.findUnique.mockResolvedValue(grupoExistente);
      mockPrisma.grupoCurso.delete.mockResolvedValue(grupoExistente);

      const resultado = await grupoCursoService.eliminarGrupo(
        usuarioProfe,
        'grupo-1'
      );

      expect(mockPrisma.grupoCurso.delete).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(grupoExistente);
    });
  });
});
