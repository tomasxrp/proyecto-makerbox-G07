const mockPrisma = require('../prismaMock');
const reservaService = require('../../src/services/ReservaService');

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

    it('Debería crear una reserva correctamente', async () => {
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

      const resultado = await reservaService.crearReserva(datos);

      expect(resultado).toEqual(nuevaReserva);
      expect(mockPrisma.reserva.create).toHaveBeenCalledTimes(1);
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
        bloqueReservados: [],
        ayudante: null,
      };

      mockPrisma.reserva.findUnique.mockResolvedValue(reserva);

      const resultado = await reservaService.obtenerReservaPorId('123');

      expect(resultado).toEqual(reserva);
      expect(mockPrisma.reserva.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
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
      });
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
    it('Debería cancelar una reserva correctamente', async () => {
      const reservaCancelada = {
        id: '123',
        solicitanteNombre: 'Juan',
        estadoReserva: 'CANCELADA',
        bloqueReservados: [],
      };

      mockPrisma.reserva.update.mockResolvedValue(reservaCancelada);

      const resultado = await reservaService.cancelarReserva('123');

      expect(resultado).toEqual(reservaCancelada);
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
    it('Debería eliminar una reserva correctamente', async () => {
      mockPrisma.reserva.delete.mockResolvedValue({ id: '123' });

      const resultado = await reservaService.eliminarReserva('123');

      expect(resultado).toEqual({ id: '123' });
      expect(mockPrisma.reserva.delete).toHaveBeenCalledWith({
        where: { id: '123' },
      });
    });
  });
});
