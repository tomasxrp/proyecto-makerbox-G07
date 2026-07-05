// backend/tests/services/BloqueHorarioService.test.js
const mockPrisma = require('../prismaMock');
const bloqueHorarioService = require('../../src/services/BloqueHorarioService');

describe('BloqueHorarioService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('crearBloqueHorario', () => {
    it('Debería lanzar error si el usuario no es ADMINISTRADOR', async () => {
      const usuario = { rol: 'ESTUDIANTE' };

      await expect(
        bloqueHorarioService.crearBloqueHorario(usuario, 1, '08:00', '09:00')
      ).rejects.toThrow('Usuario no tiene los permisos necesarios.');
    });

    it('Debería lanzar error si ya existe un bloque con el mismo nroBloque', async () => {
      const usuario = { rol: 'ADMINISTRADOR' };
      mockPrisma.bloqueHorario.findFirst.mockResolvedValue({
        id: '123',
        nroBloque: 1,
      });

      await expect(
        bloqueHorarioService.crearBloqueHorario(usuario, 1, '08:00', '09:00')
      ).rejects.toThrow('Ya existe un bloque horario con este número');
    });

    it('Debería crear un bloque horario correctamente', async () => {
      const usuario = { rol: 'ADMINISTRADOR' };
      const nuevoBloque = {
        id: '123',
        nroBloque: 1,
        horaInicio: '08:00',
        horaFin: '09:00',
      };

      mockPrisma.bloqueHorario.findFirst.mockResolvedValue(null);
      mockPrisma.bloqueHorario.create.mockResolvedValue(nuevoBloque);

      const resultado = await bloqueHorarioService.crearBloqueHorario(
        usuario,
        1,
        '08:00',
        '09:00'
      );

      expect(resultado).toEqual(nuevoBloque);
      expect(mockPrisma.bloqueHorario.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.bloqueHorario.create).toHaveBeenCalledWith({
        data: {
          nroBloque: 1,
          horaInicio: '08:00',
          horaFin: '09:00',
        },
      });
    });
  });

  describe('obtenerTodosBloques', () => {
    it('Debería lanzar error si el usuario no tiene permisos (no es ADMINISTRADOR ni PROFESOR)', async () => {
      const usuario = { rol: 'ESTUDIANTE' };

      await expect(
        bloqueHorarioService.obtenerTodosBloques(usuario)
      ).rejects.toThrow('Usuario no tiene los permisos necesarios.');
    });

    it('Debería obtener todos los bloques si es ADMINISTRADOR', async () => {
      const usuario = { rol: 'ADMINISTRADOR' };
      const bloques = [
        { id: '1', nroBloque: 1, horaInicio: '08:00', horaFin: '09:00' },
        { id: '2', nroBloque: 2, horaInicio: '09:00', horaFin: '10:00' },
      ];

      mockPrisma.bloqueHorario.findMany.mockResolvedValue(bloques);

      const resultado = await bloqueHorarioService.obtenerTodosBloques(usuario);

      expect(resultado).toEqual(bloques);
      expect(mockPrisma.bloqueHorario.findMany).toHaveBeenCalledTimes(1);
    });

    it('Debería obtener todos los bloques si es PROFESOR', async () => {
      const usuario = { rol: 'PROFESOR' };
      const bloques = [
        { id: '1', nroBloque: 1, horaInicio: '08:00', horaFin: '09:00' },
      ];

      mockPrisma.bloqueHorario.findMany.mockResolvedValue(bloques);

      const resultado = await bloqueHorarioService.obtenerTodosBloques(usuario);

      expect(resultado).toEqual(bloques);
    });
  });

  describe('obtenerBloquePorId', () => {
    it('Debería lanzar error si el usuario no tiene permisos', async () => {
      const usuario = { rol: 'ESTUDIANTE' };

      await expect(
        bloqueHorarioService.obtenerBloquePorId(usuario, '123')
      ).rejects.toThrow('Usuario no tiene los permisos necesarios.');
    });

    it('Debería lanzar error si el bloque no existe', async () => {
      const usuario = { rol: 'ADMINISTRADOR' };
      mockPrisma.bloqueHorario.findUnique.mockResolvedValue(null);

      await expect(
        bloqueHorarioService.obtenerBloquePorId(usuario, '123')
      ).rejects.toThrow('El bloque horario no existe en la base de datos');
    });

    it('Debería obtener un bloque por ID correctamente', async () => {
      const usuario = { rol: 'PROFESOR' };
      const bloque = {
        id: '123',
        nroBloque: 1,
        horaInicio: '08:00',
        horaFin: '09:00',
        bloqueReservados: [],
      };

      mockPrisma.bloqueHorario.findUnique.mockResolvedValue(bloque);

      const resultado = await bloqueHorarioService.obtenerBloquePorId(
        usuario,
        '123'
      );

      expect(resultado).toEqual(bloque);
    });
  });

  describe('actualizarBloqueHorario', () => {
    it('Debería lanzar error si el usuario no es ADMINISTRADOR', async () => {
      const usuario = { rol: 'PROFESOR' };

      await expect(
        bloqueHorarioService.actualizarBloqueHorario(
          usuario,
          '123',
          2,
          '09:00',
          '10:00'
        )
      ).rejects.toThrow('Usuario no tiene los permisos necesarios.');
    });

    it('Debería lanzar error si el bloque no existe', async () => {
      const usuario = { rol: 'ADMINISTRADOR' };
      mockPrisma.bloqueHorario.findUnique.mockResolvedValue(null);

      await expect(
        bloqueHorarioService.actualizarBloqueHorario(
          usuario,
          '123',
          2,
          '09:00',
          '10:00'
        )
      ).rejects.toThrow('El bloque horario no existe en la base de datos');
    });

    it('Debería actualizar un bloque horario correctamente', async () => {
      const usuario = { rol: 'ADMINISTRADOR' };
      const bloqueActualizado = {
        id: '123',
        nroBloque: 2,
        horaInicio: '09:00',
        horaFin: '10:00',
      };

      mockPrisma.bloqueHorario.findUnique.mockResolvedValue({
        id: '123',
      });
      mockPrisma.bloqueHorario.update.mockResolvedValue(bloqueActualizado);

      const resultado = await bloqueHorarioService.actualizarBloqueHorario(
        usuario,
        '123',
        2,
        '09:00',
        '10:00'
      );

      expect(resultado).toEqual(bloqueActualizado);
      expect(mockPrisma.bloqueHorario.update).toHaveBeenCalledWith({
        where: { id: '123' },
        data: {
          nroBloque: 2,
          horaInicio: '09:00',
          horaFin: '10:00',
        },
      });
    });
  });

  describe('eliminarBloqueHorario', () => {
    it('Debería lanzar error si el usuario no es ADMINISTRADOR', async () => {
      const usuario = { rol: 'PROFESOR' };

      await expect(
        bloqueHorarioService.eliminarBloqueHorario(usuario, '123')
      ).rejects.toThrow('Usuario no tiene los permisos necesarios.');
    });

    it('Debería lanzar error si el bloque no existe', async () => {
      const usuario = { rol: 'ADMINISTRADOR' };
      mockPrisma.bloqueHorario.findUnique.mockResolvedValue(null);

      await expect(
        bloqueHorarioService.eliminarBloqueHorario(usuario, '123')
      ).rejects.toThrow('El bloque horario no existe en la base de datos');
    });

    it('Debería eliminar un bloque horario correctamente', async () => {
      const usuario = { rol: 'ADMINISTRADOR' };
      const bloqueEliminado = {
        id: '123',
        nroBloque: 1,
        horaInicio: '08:00',
        horaFin: '09:00',
      };

      mockPrisma.bloqueHorario.findUnique.mockResolvedValue({
        id: '123',
      });
      mockPrisma.bloqueHorario.delete.mockResolvedValue(bloqueEliminado);

      const resultado = await bloqueHorarioService.eliminarBloqueHorario(
        usuario,
        '123'
      );

      expect(resultado).toEqual(bloqueEliminado);
      expect(mockPrisma.bloqueHorario.delete).toHaveBeenCalledWith({
        where: { id: '123' },
      });
    });
  });
});