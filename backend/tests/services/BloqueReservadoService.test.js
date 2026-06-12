const mockPrisma = require('../prismaMock');
const bloqueReservadoService = require('../../src/services/BloqueReservadoService');

describe('BloqueReservadoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('crearBloqueReservado', () => {
    it('Debería crear un bloque reservado correctamente', async () => {
      const datos = {
        bloqueId: '550e8400-e29b-41d4-a716-446655440000',
        reservaId: '660e8400-e29b-41d4-a716-446655440111',
      };

      const nuevoBloqueReservado = {
        bloqueId: datos.bloqueId,
        reservaId: datos.reservaId,
        bloque: {
          id: datos.bloqueId,
          nroBloque: 1,
          horaInicio: '08:00',
          horaFin: '09:00',
        },
        reserva: {
          id: datos.reservaId,
          solicitanteNombre: 'Juan',
          estadoReserva: 'PENDIENTE',
          ayudante: null,
        },
      };

      mockPrisma.bloqueReservado.create.mockResolvedValue(nuevoBloqueReservado);

      const resultado =
        await bloqueReservadoService.crearBloqueReservado(datos);

      expect(resultado).toEqual(nuevoBloqueReservado);
      expect(mockPrisma.bloqueReservado.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('obtenerBloqueReservados', () => {
    it('Debería obtener todos los bloques reservados', async () => {
      const bloques = [
        {
          bloqueId: '550e8400-e29b-41d4-a716-446655440000',
          reservaId: '660e8400-e29b-41d4-a716-446655440111',
          bloque: { nroBloque: 1, horaInicio: '08:00', horaFin: '09:00' },
          reserva: { solicitanteNombre: 'Juan' },
        },
      ];

      mockPrisma.bloqueReservado.findMany.mockResolvedValue(bloques);

      const resultado = await bloqueReservadoService.obtenerBloqueReservados();

      expect(resultado).toEqual(bloques);
      expect(mockPrisma.bloqueReservado.findMany).toHaveBeenCalledWith({
        include: {
          bloque: true,
          reserva: {
            include: {
              ayudante: {
                select: {
                  id: true,
                  nombre: true,
                  apellido: true,
                  correo: true,
                },
              },
            },
          },
        },
      });
    });
  });

  describe('obtenerBloqueReservadosPorReserva', () => {
    it('Debería obtener todos los bloques de una reserva', async () => {
      const reservaId = '660e8400-e29b-41d4-a716-446655440111';
      const bloques = [
        {
          bloqueId: '550e8400-e29b-41d4-a716-446655440000',
          reservaId,
          bloque: { nroBloque: 1, horaInicio: '08:00', horaFin: '09:00' },
          reserva: { solicitanteNombre: 'Juan' },
        },
        {
          bloqueId: '550e8400-e29b-41d4-a716-446655440001',
          reservaId,
          bloque: { nroBloque: 2, horaInicio: '09:00', horaFin: '10:00' },
          reserva: { solicitanteNombre: 'Juan' },
        },
      ];

      mockPrisma.bloqueReservado.findMany.mockResolvedValue(bloques);

      const resultado =
        await bloqueReservadoService.obtenerBloqueReservadosPorReserva(
          reservaId
        );

      expect(resultado).toEqual(bloques);
      expect(mockPrisma.bloqueReservado.findMany).toHaveBeenCalledWith({
        where: { reservaId },
        include: {
          bloque: true,
          reserva: {
            include: {
              ayudante: {
                select: {
                  id: true,
                  nombre: true,
                  apellido: true,
                  correo: true,
                },
              },
            },
          },
        },
      });
    });
  });

  describe('obtenerBloqueReservadosPorBloque', () => {
    it('Debería obtener todas las reservas de un bloque', async () => {
      const bloqueId = '550e8400-e29b-41d4-a716-446655440000';
      const bloques = [
        {
          bloqueId,
          reservaId: '660e8400-e29b-41d4-a716-446655440111',
          bloque: { nroBloque: 1, horaInicio: '08:00', horaFin: '09:00' },
          reserva: { solicitanteNombre: 'Juan' },
        },
      ];

      mockPrisma.bloqueReservado.findMany.mockResolvedValue(bloques);

      const resultado =
        await bloqueReservadoService.obtenerBloqueReservadosPorBloque(bloqueId);

      expect(resultado).toEqual(bloques);
      expect(mockPrisma.bloqueReservado.findMany).toHaveBeenCalledWith({
        where: { bloqueId },
        include: {
          bloque: true,
          reserva: {
            include: {
              ayudante: {
                select: {
                  id: true,
                  nombre: true,
                  apellido: true,
                  correo: true,
                },
              },
            },
          },
        },
      });
    });
  });

  describe('obtenerBloqueReservadoPorId', () => {
    it('Debería lanzar error si el bloque reservado no existe', async () => {
      mockPrisma.bloqueReservado.findUnique.mockResolvedValue(null);

      await expect(
        bloqueReservadoService.obtenerBloqueReservadoPorId(
          '550e8400-e29b-41d4-a716-446655440000',
          '660e8400-e29b-41d4-a716-446655440111'
        )
      ).rejects.toThrow('Bloque reservado no encontrado');
    });

    it('Debería obtener un bloque reservado por ID', async () => {
      const bloqueReservado = {
        bloqueId: '550e8400-e29b-41d4-a716-446655440000',
        reservaId: '660e8400-e29b-41d4-a716-446655440111',
        bloque: { nroBloque: 1, horaInicio: '08:00', horaFin: '09:00' },
        reserva: { solicitanteNombre: 'Juan' },
      };

      mockPrisma.bloqueReservado.findUnique.mockResolvedValue(bloqueReservado);

      const resultado =
        await bloqueReservadoService.obtenerBloqueReservadoPorId(
          bloqueReservado.bloqueId,
          bloqueReservado.reservaId
        );

      expect(resultado).toEqual(bloqueReservado);
    });
  });

  describe('verificarDisponibilidadBloque', () => {
    it('Debería retornar true si el bloque está disponible', async () => {
      mockPrisma.bloqueReservado.findFirst.mockResolvedValue(null);

      const resultado =
        await bloqueReservadoService.verificarDisponibilidadBloque(
          '550e8400-e29b-41d4-a716-446655440000',
          '2026-07-15T10:00:00Z'
        );

      expect(resultado).toBe(true);
    });

    it('Debería retornar false si el bloque ya está reservado', async () => {
      mockPrisma.bloqueReservado.findFirst.mockResolvedValue({
        bloqueId: '550e8400-e29b-41d4-a716-446655440000',
        reservaId: '660e8400-e29b-41d4-a716-446655440111',
      });

      const resultado =
        await bloqueReservadoService.verificarDisponibilidadBloque(
          '550e8400-e29b-41d4-a716-446655440000',
          '2026-07-15T10:00:00Z'
        );

      expect(resultado).toBe(false);
    });
  });

  describe('eliminarBloqueReservado', () => {
    it('Debería eliminar un bloque reservado', async () => {
      mockPrisma.bloqueReservado.delete.mockResolvedValue({
        bloqueId: '550e8400-e29b-41d4-a716-446655440000',
        reservaId: '660e8400-e29b-41d4-a716-446655440111',
      });

      const resultado = await bloqueReservadoService.eliminarBloqueReservado(
        '550e8400-e29b-41d4-a716-446655440000',
        '660e8400-e29b-41d4-a716-446655440111'
      );

      expect(resultado).toEqual({
        bloqueId: '550e8400-e29b-41d4-a716-446655440000',
        reservaId: '660e8400-e29b-41d4-a716-446655440111',
      });
      expect(mockPrisma.bloqueReservado.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe('eliminarBloquesPorReserva', () => {
    it('Debería eliminar todos los bloques de una reserva', async () => {
      mockPrisma.bloqueReservado.deleteMany.mockResolvedValue({ count: 2 });

      const resultado = await bloqueReservadoService.eliminarBloquesPorReserva(
        '660e8400-e29b-41d4-a716-446655440111'
      );

      expect(resultado).toEqual({ count: 2 });
      expect(mockPrisma.bloqueReservado.deleteMany).toHaveBeenCalledWith({
        where: { reservaId: '660e8400-e29b-41d4-a716-446655440111' },
      });
    });
  });
});
