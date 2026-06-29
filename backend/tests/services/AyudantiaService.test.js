const mockPrisma = require('../prismaMock');
const ayudantiaService = require('../../src/services/AyudantiaService');

describe('AyudantiaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('crearAyudantia', () => {
    it('Debería lanzar un error si el usuario no tiene permisos', async () => {
      const usuarioInvalido = { rol: 'ESTUDIANTE' };
      const datos = {
        nombreAyudantia: 'Test',
        refCurso: 'curso-id',
        refAyudante: 'ayu-id',
        horario: '2026-07-15T15:00:00Z',
        cupoMaximo: 20,
        estado: 'ACTIVA',
      };

      await expect(
        ayudantiaService.crearAyudantia(usuarioInvalido, datos)
      ).rejects.toThrow('Usuario no tiene los permisos necesarios.');

      expect(mockPrisma.ayudantia.create).not.toHaveBeenCalled();
    });

    it('Debería crear la ayudantía si el usuario tiene permisos', async () => {
      const usuarioValido = { rol: 'ADMINISTRADOR' };
      const datos = {
        nombreAyudantia: 'Test',
        refCurso: 'curso-id',
        refAyudante: 'ayu-id',
        horario: '2026-07-15T15:00:00Z',
        cupoMaximo: 20,
        estado: 'ACTIVA',
      };

      const ayudantiaSimulada = {
        id: 1,
        ...datos,
        horario: new Date(datos.horario),
      };
      mockPrisma.ayudantia.create.mockResolvedValue(ayudantiaSimulada);

      const resultado = await ayudantiaService.crearAyudantia(
        usuarioValido,
        datos
      );

      expect(resultado).toEqual(ayudantiaSimulada);
      expect(mockPrisma.ayudantia.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('obtenerAyudantias', () => {
    it('Debería retornar todas las ayudantías', async () => {
      const ayudantiasMock = [{ id: 1, nombreAyudantia: 'A1' }];
      mockPrisma.ayudantia.findMany.mockResolvedValue(ayudantiasMock);

      const resultado = await ayudantiaService.obtenerAyudantias();

      expect(resultado).toEqual(ayudantiasMock);
      expect(mockPrisma.ayudantia.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('eliminarAyudantia', () => {
    it('Debería lanzar un error si la ayudantía no existe', async () => {
      const usuarioValido = { rol: 'PROFESOR' };
      mockPrisma.ayudantia.findUnique.mockResolvedValue(null);

      await expect(
        ayudantiaService.eliminarAyudantia(usuarioValido, 'id-falso')
      ).rejects.toThrow('La ayudantía no existe en la base de datos');
    });

    it('Debería eliminar la ayudantía si existe', async () => {
      const usuarioValido = { rol: 'AYUDANTE' };
      const ayudantiaMock = { id: 'id-real', nombreAyudantia: 'Test' };

      mockPrisma.ayudantia.findUnique.mockResolvedValue(ayudantiaMock);
      mockPrisma.ayudantia.delete.mockResolvedValue(ayudantiaMock);

      const resultado = await ayudantiaService.eliminarAyudantia(
        usuarioValido,
        'id-real'
      );

      expect(resultado).toEqual(ayudantiaMock);
      expect(mockPrisma.ayudantia.delete).toHaveBeenCalledWith({
        where: { id: 'id-real' },
      });
    });
  });
});
