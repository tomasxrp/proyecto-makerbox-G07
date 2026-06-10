const mockPrisma = require('../prismaMock');
const semestreService = require('../../src/services/SemestreService');

describe('SemestreService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('crearSemestre', () => {
    it('Debería lanzar un error si el usuario no es ADMINISTRADOR...', async () => {
      const usuarioInvalido = { rol: 'ESTUDIANTE' };

      await expect(
        semestreService.crearSemestre(
          usuarioInvalido,
          2026,
          1,
          '2026-03-01',
          '2026-07-15',
          'ACTIVO'
        )
      ).rejects.toThrow('Usuario no tiene los permisos necesarios.');

      expect(mockPrisma.semestre.create).not.toHaveBeenCalled();
    });

    it('Debería crear el semestre si el usuario es ADMINISTRADOR', async () => {
      const usuarioValido = { rol: 'ADMINISTRADOR' };
      const semestreSimulado = {
        id: 1,
        anio: 2026,
        periodo: 1,
        estado: 'ACTIVO',
      };

      // Simular la respuesta exitosa de la base de datos
      mockPrisma.semestre.create.mockResolvedValue(semestreSimulado);

      const resultado = await semestreService.crearSemestre(
        usuarioValido,
        2026,
        1,
        '2026-03-01',
        '2026-07-15',
        'ACTIVO'
      );

      expect(resultado.mensaje).toBe('Semestre creado con exito');
      expect(resultado.nuevoSemestre).toEqual(semestreSimulado);
      expect(mockPrisma.semestre.create).toHaveBeenCalledTimes(1);
    });
  });
});
