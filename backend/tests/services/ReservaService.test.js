const mockPrisma = require('../prismaMock');
const reservaService = require('../../src/services/ReservaService');
const bloqueReservadoService = require('../../src/services/BloqueReservadoService');

jest.mock('../../src/services/BloqueReservadoService');

describe('ReservaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('crearReserva', () => {
    it('Debería lanzar error si falta fechaReserva', async () => {
      const datos = {
        solicitanteNombre: 'Juan',
        solicitanteApellido: 'Pérez',
        solicitanteCorreo: 'juan@utalca.cl',
        solicitanteRut: '12345678-9',
        motivoReserva: 'Usar impresora 3D',
      };

      await expect(reservaService.crearReserva(datos)).rejects.toThrow();
    });

    it('Debería crear una reserva sin bloques', async () => {
      const datos = {
        fechaReserva: '2026-07-15T10:00:00Z',
        solicitanteNombre: 'Juan',
        solicitanteApellido: 'Pérez',
        solicitanteCorreo: 'juan@utalca.cl',
        solicitanteRut: '12345678-9',
        motivoReserva: 'Usar impresora 3D',
        refAyudante: null,
      };

      const nuevaReserva = {
        id: '123',
        fechaReserva: new Date('2026-07-15T10:00:00Z'),
        estadoReserva: 'PENDIENTE',
        solicitanteNombre: 'Juan',
        solicitanteApellido: 'Pérez',
        solicitanteCorreo: 'juan@utalca.cl',
        solicitanteRut: '12345678-9',
        motivoReserva: 'Usar impresora 3D',
        refAyudante: null,
        creadoEn: new Date(),
        bloqueReservados: [],
        ayudante: null,
      };

      mockPrisma.reserva.create.mockResolvedValue(nuevaReserva);
      mockPrisma.reserva.findUnique.mockResolvedValue(nuevaReserva);

      const resultado = await reservaService.crearReserva(datos);

      expect(resultado).toEqual(nuevaReserva);
      expect(mockPrisma.reserva.create).toHaveBeenCalledTimes(1);
      expect(
        bloqueReservadoService.crearBloqueReservado
      ).not.toHaveBeenCalled();
    });

    it('Debería crear una reserva con bloques', async () => {
      const datos = {
        fechaReserva: '2026-07-15T10:00:00Z',
        solicitanteNombre: 'Juan',
        solicitanteApellido: 'Pérez',
        solicitanteCorreo: 'juan@utalca.cl',
        solicitanteRut: '12345678-9',
        motivoReserva: 'Usar impresora 3D',
        bloqueIds: [
          '550e8400-e29b-41d4-a716-446655440000',
          '550e8400-e29b-41d4-a716-446655440001',
        ],
        ayudante: null,
      };

      const nuevaReserva = {
        id: '123',
        fechaReserva: new Date('2026-07-15T10:00:00Z'),
        estadoReserva: 'PENDIENTE',
        solicitanteNombre: 'Juan',
        bloqueReservados: [
          {
            bloqueId: '550e8400-e29b-41d4-a716-446655440000',
            reservaId: '123',
            bloque: { nroBloque: 1 },
          },
          {
            bloqueId: '550e8400-e29b-41d4-a716-446655440001',
            reservaId: '123',
            bloque: { nroBloque: 2 },
          },
        ],
        ayudante: null,
      };

      mockPrisma.reserva.create.mockResolvedValue(nuevaReserva);
      mockPrisma.reserva.findUnique.mockResolvedValue(nuevaReserva);
      bloqueReservadoService.crearBloqueReservado.mockResolvedValue({});

      const resultado = await reservaService.crearReserva(datos);

      expect(resultado).toEqual(nuevaReserva);
      expect(mockPrisma.reserva.create).toHaveBeenCalledTimes(1);
      expect(bloqueReservadoService.crearBloqueReservado).toHaveBeenCalledTimes(
        2
      );
    });
  });

  describe('obtenerReservas', () => {
    it('Debería obtener todas las reservas si el usuario es ADMINISTRADOR', async () => {
      const usuario = { rol: 'ADMINISTRADOR', id: 'user1' };
      const reservas = [
        {
          id: '1',
          solicitanteNombre: 'Juan',
          estadoReserva: 'PENDIENTE',
          fechaReserva: new Date('2026-07-15T10:00:00Z'),
          bloqueReservados: [],
        },
      ];

      mockPrisma.reserva.findMany.mockResolvedValue(reservas);

      const resultado = await reservaService.obtenerReservas(usuario);

      expect(resultado).toEqual(reservas);
      expect(mockPrisma.reserva.findMany).toHaveBeenCalledTimes(1);
    });

    it('Debería obtener solo las reservas del ayudante si es AYUDANTE', async () => {
      const usuario = { rol: 'AYUDANTE', id: 'ayudante1' };
      const reservas = [
        {
          id: '1',
          solicitanteNombre: 'Juan',
          refAyudante: 'ayudante1',
          estadoReserva: 'PENDIENTE',
        },
      ];

      mockPrisma.reserva.findMany.mockResolvedValue(reservas);

      const resultado = await reservaService.obtenerReservas(usuario);

      expect(resultado).toEqual(reservas);
      expect(mockPrisma.reserva.findMany).toHaveBeenCalledWith({
        where: { refAyudante: 'ayudante1' },
        include: {
          bloqueReservados: {
            include: {
              bloque: true,
            },
          },
          ayudante: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              correo: true,
            },
          },
        },
        orderBy: { creadoEn: 'desc' },
      });
    });

    it('Debería filtrar reservas por estado', async () => {
      const usuario = { rol: 'ADMINISTRADOR', id: 'user1' };
      const filtros = { estado: 'CONFIRMADA' };
      const reservas = [
        {
          id: '1',
          estadoReserva: 'CONFIRMADA',
          solicitanteNombre: 'Juan',
        },
      ];

      mockPrisma.reserva.findMany.mockResolvedValue(reservas);

      const resultado = await reservaService.obtenerReservas(usuario, filtros);

      expect(resultado).toEqual(reservas);
      expect(mockPrisma.reserva.findMany).toHaveBeenCalledWith({
        where: { estadoReserva: 'CONFIRMADA' },
        include: {
          bloqueReservados: {
            include: {
              bloque: true,
            },
          },
          ayudante: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              correo: true,
            },
          },
        },
        orderBy: { creadoEn: 'desc' },
      });
    });
  });

  describe('obtenerReservaPorId', () => {
    it('Debería lanzar error si la reserva no existe', async () => {
      mockPrisma.reserva.findUnique.mockResolvedValue(null);

      await expect(
        reservaService.obtenerReservaPorId('id-inexistente')
      ).rejects.toThrow('Reserva no encontrada');
    });

    it('Debería obtener una reserva por ID correctamente', async () => {
      const reserva = {
        id: '123',
        solicitanteNombre: 'Juan',
        solicitanteApellido: 'Pérez',
        estadoReserva: 'PENDIENTE',
        fechaReserva: new Date('2026-07-15T10:00:00Z'),
        bloqueReservados: [
          {
            bloqueId: '550e8400-e29b-41d4-a716-446655440000',
            bloque: { nroBloque: 1 },
          },
        ],
        ayudante: null,
      };

      mockPrisma.reserva.findUnique.mockResolvedValue(reserva);

      const resultado = await reservaService.obtenerReservaPorId('123');

      expect(resultado).toEqual(reserva);
    });
  });

  describe('actualizarReserva', () => {
    it('Debería actualizar una reserva correctamente', async () => {
      const reservaActualizada = {
        id: '123',
        solicitanteNombre: 'Carlos',
        estadoReserva: 'PENDIENTE',
        bloqueReservados: [],
        ayudante: null,
      };

      mockPrisma.reserva.update.mockResolvedValue(reservaActualizada);

      const datos = { solicitanteNombre: 'Carlos' };
      const resultado = await reservaService.actualizarReserva('123', datos);

      expect(resultado).toEqual(reservaActualizada);
      expect(mockPrisma.reserva.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('cancelarReserva', () => {
    it('Debería cancelar una reserva correctamente y eliminar bloques reservados', async () => {
      const reservaCancelada = {
        id: '123',
        solicitanteNombre: 'Juan',
        estadoReserva: 'CANCELADA',
        bloqueReservados: [],
      };

      bloqueReservadoService.eliminarBloquesPorReserva.mockResolvedValue({
        count: 2,
      });
      mockPrisma.reserva.update.mockResolvedValue(reservaCancelada);

      const resultado = await reservaService.cancelarReserva('123');

      expect(resultado).toEqual(reservaCancelada);
      expect(
        bloqueReservadoService.eliminarBloquesPorReserva
      ).toHaveBeenCalledWith('123');
      expect(mockPrisma.reserva.update).toHaveBeenCalledWith({
        where: { id: '123' },
        data: { estadoReserva: 'CANCELADA' },
        include: {
          bloqueReservados: {
            include: {
              bloque: true,
            },
          },
        },
      });
    });
  });

  describe('confirmarReserva', () => {
    it('Debería lanzar error si el usuario no es AYUDANTE ni ADMINISTRADOR', async () => {
      const usuario = { rol: 'ESTUDIANTE', id: 'user1' };

      await expect(
        reservaService.confirmarReserva('123', usuario)
      ).rejects.toThrow(
        'Solo ayudantes o administradores pueden confirmar reservas'
      );
    });

    it('Debería confirmar una reserva si el usuario es AYUDANTE', async () => {
      const usuario = { rol: 'AYUDANTE', id: 'ayudante1' };
      const reservaConfirmada = {
        id: '123',
        solicitanteNombre: 'Juan',
        estadoReserva: 'CONFIRMADA',
        refAyudante: 'ayudante1',
        bloqueReservados: [],
        ayudante: {
          id: 'ayudante1',
          nombre: 'Carlos',
          apellido: 'Soto',
          correo: 'carlos@utalca.cl',
        },
      };

      mockPrisma.reserva.update.mockResolvedValue(reservaConfirmada);

      const resultado = await reservaService.confirmarReserva('123', usuario);

      expect(resultado).toEqual(reservaConfirmada);
      expect(mockPrisma.reserva.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('eliminarReserva', () => {
    it('Debería eliminar una reserva correctamente y eliminar bloques reservados', async () => {
      bloqueReservadoService.eliminarBloquesPorReserva.mockResolvedValue({
        count: 2,
      });
      mockPrisma.reserva.delete.mockResolvedValue({ id: '123' });

      const resultado = await reservaService.eliminarReserva('123');

      expect(resultado).toEqual({ id: '123' });
      expect(
        bloqueReservadoService.eliminarBloquesPorReserva
      ).toHaveBeenCalledWith('123');
      expect(mockPrisma.reserva.delete).toHaveBeenCalledWith({
        where: { id: '123' },
      });
    });
  });
});
