// eslint-disable-next-line
const mockPrisma = require('../prismaMock');

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/index');

jest.mock('jsonwebtoken');

describe('Prueba de integración API reservas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/reservas/crear', () => {
    it('Si faltan datos obligatorios debe retornar error 400', async () => {
      const response = await request(app).post('/api/reservas/crear').send({
        solicitanteNombre: 'Juan',
        solicitanteApellido: 'Pérez',
        // Faltan otros campos
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('mensaje');
    });

    it('Si el correo es inválido debe retornar error 400', async () => {
      const response = await request(app).post('/api/reservas/crear').send({
        fechaReserva: '2026-07-15T10:00:00Z',
        solicitanteNombre: 'Juan',
        solicitanteApellido: 'Pérez',
        solicitanteCorreo: 'correo-invalido',
        solicitanteRut: '12345678-9',
        motivoReserva: 'Usar sala',
      });

      expect(response.status).toBe(400);
      expect(response.body.mensaje).toBe(
        'El correo proporcionado no es válido'
      );
    });

    it('Si la fecha es en el pasado debe retornar error 400', async () => {
      const fechaPasada = new Date(
        new Date().getTime() - 86400000
      ).toISOString();

      const response = await request(app).post('/api/reservas/crear').send({
        fechaReserva: fechaPasada,
        solicitanteNombre: 'Juan',
        solicitanteApellido: 'Pérez',
        solicitanteCorreo: 'juan@utalca.cl',
        solicitanteRut: '12345678-9',
        motivoReserva: 'Usar sala',
      });

      expect(response.status).toBe(400);
      expect(response.body.mensaje).toBe(
        'La fecha de reserva debe ser en el futuro'
      );
    });

    it('Si todo es correcto debe retornar 201 y crear la reserva', async () => {
      const fechaFutura = new Date(
        new Date().getTime() + 86400000
      ).toISOString();

      mockPrisma.reserva.create.mockResolvedValue({
        id: '123',
        fechaReserva: new Date(fechaFutura),
        estadoReserva: 'PENDIENTE',
        solicitanteNombre: 'Juan',
        solicitanteApellido: 'Pérez',
        solicitanteCorreo: 'juan@utalca.cl',
        solicitanteRut: '12345678-9',
        motivoReserva: 'Usar sala interactiva',
        refAyudante: null,
        creadoEn: new Date(),
        bloqueReservados: [],
        ayudante: null,
      });

      const response = await request(app).post('/api/reservas/crear').send({
        fechaReserva: fechaFutura,
        solicitanteNombre: 'Juan',
        solicitanteApellido: 'Pérez',
        solicitanteCorreo: 'juan@utalca.cl',
        solicitanteRut: '12345678-9',
        motivoReserva: 'Usar sala interactiva',
      });

      expect(response.status).toBe(201);
      expect(response.body.mensaje).toBe('Reserva creada exitosamente');
      expect(response.body.reserva.solicitanteNombre).toBe('Juan');
      expect(response.body.reserva.estadoReserva).toBe('PENDIENTE');
    });
  });

  describe('GET /api/reservas/', () => {
    it('Si no se envía token debe retornar error 401', async () => {
      const response = await request(app).get('/api/reservas/');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('mensaje');
    });

    it('Si el token es válido debe retornar 200 y las reservas', async () => {
      jwt.verify.mockReturnValue({ id: 1, rol: 'ADMINISTRADOR' });
      mockPrisma.reserva.findMany.mockResolvedValue([
        {
          id: '1',
          solicitanteNombre: 'Juan',
          estadoReserva: 'PENDIENTE',
          fechaReserva: new Date('2026-07-15T10:00:00Z'),
          bloqueReservados: [],
          ayudante: null,
        },
        {
          id: '2',
          solicitanteNombre: 'Carlos',
          estadoReserva: 'CONFIRMADA',
          fechaReserva: new Date('2026-07-16T10:00:00Z'),
          bloqueReservados: [],
          ayudante: null,
        },
      ]);

      const response = await request(app)
        .get('/api/reservas/')
        .set('Authorization', 'Bearer token_simulado');

      expect(response.status).toBe(200);
      expect(response.body.mensaje).toBe('Reservas obtenidas exitosamente');
      expect(response.body.reservas).toHaveLength(2);
    });

    it('Si es AYUDANTE debe obtener solo sus reservas asignadas', async () => {
      jwt.verify.mockReturnValue({ id: 'ayudante1', rol: 'AYUDANTE' });
      mockPrisma.reserva.findMany.mockResolvedValue([
        {
          id: '1',
          solicitanteNombre: 'Juan',
          refAyudante: 'ayudante1',
          estadoReserva: 'CONFIRMADA',
          bloqueReservados: [],
          ayudante: {
            id: 'ayudante1',
            nombre: 'Carlos',
            apellido: 'Soto',
            correo: 'carlos@utalca.cl',
          },
        },
      ]);

      const response = await request(app)
        .get('/api/reservas/')
        .set('Authorization', 'Bearer token_simulado_ayudante');

      expect(response.status).toBe(200);
      expect(response.body.reservas).toHaveLength(1);
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

    it('Debe filtrar reservas por estado', async () => {
      jwt.verify.mockReturnValue({ id: 1, rol: 'ADMINISTRADOR' });
      mockPrisma.reserva.findMany.mockResolvedValue([
        {
          id: '2',
          solicitanteNombre: 'Carlos',
          estadoReserva: 'CONFIRMADA',
          bloqueReservados: [],
          ayudante: null,
        },
      ]);

      const response = await request(app)
        .get('/api/reservas/?estado=CONFIRMADA')
        .set('Authorization', 'Bearer token_simulado');

      expect(response.status).toBe(200);
      expect(response.body.reservas).toHaveLength(1);
      expect(response.body.reservas[0].estadoReserva).toBe('CONFIRMADA');
    });
  });

  describe('GET /api/reservas/:id', () => {
    it('Si no se envía token debe retornar error 401', async () => {
      const response = await request(app).get('/api/reservas/123');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('mensaje');
    });

    it('Si la reserva no existe debe retornar error 404', async () => {
      jwt.verify.mockReturnValue({ id: 1, rol: 'ADMINISTRADOR' });
      mockPrisma.reserva.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/reservas/id-inexistente')
        .set('Authorization', 'Bearer token_simulado');

      expect(response.status).toBe(404);
      expect(response.body.mensaje).toBe('Reserva no encontrada');
    });

    it('Debe retornar 200 y la reserva solicitada', async () => {
      jwt.verify.mockReturnValue({ id: 1, rol: 'ADMINISTRADOR' });
      mockPrisma.reserva.findUnique.mockResolvedValue({
        id: '123',
        solicitanteNombre: 'Juan',
        solicitanteApellido: 'Pérez',
        estadoReserva: 'PENDIENTE',
        fechaReserva: new Date('2026-07-15T10:00:00Z'),
        bloqueReservados: [],
        ayudante: null,
      });

      const response = await request(app)
        .get('/api/reservas/123')
        .set('Authorization', 'Bearer token_simulado');

      expect(response.status).toBe(200);
      expect(response.body.mensaje).toBe('Reserva obtenida exitosamente');
      expect(response.body.reserva.id).toBe('123');
      expect(response.body.reserva.solicitanteNombre).toBe('Juan');
    });
  });

  describe('PUT /api/reservas/:id', () => {
    it('Si no se envía token debe retornar error 401', async () => {
      const response = await request(app)
        .put('/api/reservas/123')
        .send({ solicitanteNombre: 'Carlos' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('mensaje');
    });

    it('Debe actualizar una reserva correctamente', async () => {
      jwt.verify.mockReturnValue({ id: 1, rol: 'ADMINISTRADOR' });
      mockPrisma.reserva.update.mockResolvedValue({
        id: '123',
        solicitanteNombre: 'Carlos',
        solicitanteApellido: 'Pérez',
        estadoReserva: 'PENDIENTE',
        bloqueReservados: [],
        ayudante: null,
      });

      const response = await request(app)
        .put('/api/reservas/123')
        .set('Authorization', 'Bearer token_simulado')
        .send({
          solicitanteNombre: 'Carlos',
        });

      expect(response.status).toBe(200);
      expect(response.body.mensaje).toBe('Reserva actualizada exitosamente');
      expect(response.body.reserva.solicitanteNombre).toBe('Carlos');
    });
  });

  describe('PATCH /api/reservas/:id/cancelar', () => {
    it('Si no se envía token debe retornar error 401', async () => {
      const response = await request(app).patch('/api/reservas/123/cancelar');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('mensaje');
    });

    it('Debe cancelar una reserva correctamente', async () => {
      jwt.verify.mockReturnValue({ id: 1, rol: 'ADMINISTRADOR' });
      mockPrisma.reserva.update.mockResolvedValue({
        id: '123',
        solicitanteNombre: 'Juan',
        estadoReserva: 'CANCELADA',
        bloqueReservados: [],
      });

      const response = await request(app)
        .patch('/api/reservas/123/cancelar')
        .set('Authorization', 'Bearer token_simulado');

      expect(response.status).toBe(200);
      expect(response.body.mensaje).toBe('Reserva cancelada exitosamente');
      expect(response.body.reserva.estadoReserva).toBe('CANCELADA');
    });
  });

  describe('PATCH /api/reservas/:id/confirmar', () => {
    it('Si no se envía token debe retornar error 401', async () => {
      const response = await request(app).patch('/api/reservas/123/confirmar');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('mensaje');
    });

    it('Si el usuario no es AYUDANTE ni ADMINISTRADOR debe retornar error 400', async () => {
      jwt.verify.mockReturnValue({ id: 1, rol: 'ESTUDIANTE' });

      const response = await request(app)
        .patch('/api/reservas/123/confirmar')
        .set('Authorization', 'Bearer token_simulado_estudiante');

      expect(response.status).toBe(400);
      expect(response.body.mensaje).toBe(
        'Solo ayudantes o administradores pueden confirmar reservas'
      );
    });

    it('Debe confirmar una reserva si es AYUDANTE', async () => {
      jwt.verify.mockReturnValue({ id: 'ayudante1', rol: 'AYUDANTE' });
      mockPrisma.reserva.update.mockResolvedValue({
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
      });

      const response = await request(app)
        .patch('/api/reservas/123/confirmar')
        .set('Authorization', 'Bearer token_simulado_ayudante');

      expect(response.status).toBe(200);
      expect(response.body.mensaje).toBe('Reserva confirmada exitosamente');
      expect(response.body.reserva.estadoReserva).toBe('CONFIRMADA');
    });
  });

  describe('DELETE /api/reservas/:id', () => {
    it('Si no se envía token debe retornar error 401', async () => {
      const response = await request(app).delete('/api/reservas/123');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('mensaje');
    });

    it('Debe eliminar una reserva correctamente', async () => {
      jwt.verify.mockReturnValue({ id: 1, rol: 'ADMINISTRADOR' });
      mockPrisma.reserva.delete.mockResolvedValue({ id: '123' });

      const response = await request(app)
        .delete('/api/reservas/123')
        .set('Authorization', 'Bearer token_simulado');

      expect(response.status).toBe(200);
      expect(response.body.mensaje).toBe('Reserva eliminada exitosamente');
    });
  });
});
