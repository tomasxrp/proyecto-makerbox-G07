// eslint-disable-next-line
const mockPrisma = require('../prismaMock');

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/index');

jest.mock('jsonwebtoken');

describe('Prueba de integración API bloque reservado', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/bloque-reservado/crear', () => {
    it('Si no se envía token debe retornar error 401', async () => {
      const response = await request(app)
        .post('/api/bloque-reservado/crear')
        .send({
          bloqueId: '550e8400-e29b-41d4-a716-446655440000',
          reservaId: '660e8400-e29b-41d4-a716-446655440111',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('mensaje');
    });

    it('Si faltan datos obligatorios debe retornar error 400', async () => {
      jwt.verify.mockReturnValue({ id: 1, rol: 'ADMINISTRADOR' });

      const response = await request(app)
        .post('/api/bloque-reservado/crear')
        .set('Authorization', 'Bearer token_simulado')
        .send({
          bloqueId: '550e8400-e29b-41d4-a716-446655440000',
          // Falta reservaId
        });

      expect(response.status).toBe(400);
      expect(response.body.mensaje).toBe('El ID de la reserva es requerido');
    });

    it('Si los IDs no son UUID válidos debe retornar error 400', async () => {
      jwt.verify.mockReturnValue({ id: 1, rol: 'ADMINISTRADOR' });

      const response = await request(app)
        .post('/api/bloque-reservado/crear')
        .set('Authorization', 'Bearer token_simulado')
        .send({
          bloqueId: 'id-invalido',
          reservaId: '660e8400-e29b-41d4-a716-446655440111',
        });

      expect(response.status).toBe(400);
      expect(response.body.mensaje).toBe(
        'El ID del bloque no tiene un formato válido'
      );
    });

    it('Si todo es correcto debe retornar 201 y crear el bloque reservado', async () => {
      jwt.verify.mockReturnValue({ id: 1, rol: 'ADMINISTRADOR' });

      mockPrisma.bloqueReservado.create.mockResolvedValue({
        bloqueId: '550e8400-e29b-41d4-a716-446655440000',
        reservaId: '660e8400-e29b-41d4-a716-446655440111',
        bloque: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          nroBloque: 1,
          horaInicio: '08:00',
          horaFin: '09:00',
        },
        reserva: {
          id: '660e8400-e29b-41d4-a716-446655440111',
          solicitanteNombre: 'Juan',
          estadoReserva: 'PENDIENTE',
        },
      });

      const response = await request(app)
        .post('/api/bloque-reservado/crear')
        .set('Authorization', 'Bearer token_simulado')
        .send({
          bloqueId: '550e8400-e29b-41d4-a716-446655440000',
          reservaId: '660e8400-e29b-41d4-a716-446655440111',
        });

      expect(response.status).toBe(201);
      expect(response.body.mensaje).toBe(
        'Bloque reservado creado exitosamente'
      );
      expect(response.body.bloqueReservado.bloque.nroBloque).toBe(1);
    });
  });

  describe('GET /api/bloque-reservado/', () => {
    it('Si no se envía token debe retornar error 401', async () => {
      const response = await request(app).get('/api/bloque-reservado/');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('mensaje');
    });

    it('Debe retornar 200 y todos los bloques reservados', async () => {
      jwt.verify.mockReturnValue({ id: 1, rol: 'ADMINISTRADOR' });

      mockPrisma.bloqueReservado.findMany.mockResolvedValue([
        {
          bloqueId: '550e8400-e29b-41d4-a716-446655440000',
          reservaId: '660e8400-e29b-41d4-a716-446655440111',
          bloque: {
            nroBloque: 1,
            horaInicio: '08:00',
            horaFin: '09:00',
          },
          reserva: { solicitanteNombre: 'Juan' },
        },
      ]);

      const response = await request(app)
        .get('/api/bloque-reservado/')
        .set('Authorization', 'Bearer token_simulado');

      expect(response.status).toBe(200);
      expect(response.body.mensaje).toBe(
        'Todos los bloques reservados obtenidos exitosamente'
      );
      expect(response.body.bloques).toHaveLength(1);
    });
  });

  describe('GET /api/bloque-reservado/reserva/:reservaId', () => {
    it('Si no se envía token debe retornar error 401', async () => {
      const response = await request(app).get(
        '/api/bloque-reservado/reserva/660e8400-e29b-41d4-a716-446655440111'
      );

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('mensaje');
    });

    it('Debe retornar 200 y los bloques de una reserva', async () => {
      jwt.verify.mockReturnValue({ id: 1, rol: 'ADMINISTRADOR' });

      mockPrisma.bloqueReservado.findMany.mockResolvedValue([
        {
          bloqueId: '550e8400-e29b-41d4-a716-446655440000',
          reservaId: '660e8400-e29b-41d4-a716-446655440111',
          bloque: {
            nroBloque: 1,
            horaInicio: '08:00',
            horaFin: '09:00',
          },
          reserva: { solicitanteNombre: 'Juan' },
        },
        {
          bloqueId: '550e8400-e29b-41d4-a716-446655440001',
          reservaId: '660e8400-e29b-41d4-a716-446655440111',
          bloque: {
            nroBloque: 2,
            horaInicio: '09:00',
            horaFin: '10:00',
          },
          reserva: { solicitanteNombre: 'Juan' },
        },
      ]);

      const response = await request(app)
        .get(
          '/api/bloque-reservado/reserva/660e8400-e29b-41d4-a716-446655440111'
        )
        .set('Authorization', 'Bearer token_simulado');

      expect(response.status).toBe(200);
      expect(response.body.mensaje).toBe(
        'Bloques reservados obtenidos exitosamente'
      );
      expect(response.body.bloques).toHaveLength(2);
    });
  });

  describe('GET /api/bloque-reservado/bloque/:bloqueId', () => {
    it('Si no se envía token debe retornar error 401', async () => {
      const response = await request(app).get(
        '/api/bloque-reservado/bloque/550e8400-e29b-41d4-a716-446655440000'
      );

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('mensaje');
    });

    it('Debe retornar 200 y las reservas de un bloque', async () => {
      jwt.verify.mockReturnValue({ id: 1, rol: 'ADMINISTRADOR' });

      mockPrisma.bloqueReservado.findMany.mockResolvedValue([
        {
          bloqueId: '550e8400-e29b-41d4-a716-446655440000',
          reservaId: '660e8400-e29b-41d4-a716-446655440111',
          bloque: {
            nroBloque: 1,
            horaInicio: '08:00',
            horaFin: '09:00',
          },
          reserva: { solicitanteNombre: 'Juan' },
        },
      ]);

      const response = await request(app)
        .get(
          '/api/bloque-reservado/bloque/550e8400-e29b-41d4-a716-446655440000'
        )
        .set('Authorization', 'Bearer token_simulado');

      expect(response.status).toBe(200);
      expect(response.body.mensaje).toBe(
        'Bloques reservados obtenidos exitosamente'
      );
      expect(response.body.bloques).toHaveLength(1);
    });
  });

  describe('GET /api/bloque-reservado/:bloqueId/:reservaId', () => {
    it('Si no se envía token debe retornar error 401', async () => {
      const response = await request(app).get(
        '/api/bloque-reservado/550e8400-e29b-41d4-a716-446655440000/660e8400-e29b-41d4-a716-446655440111'
      );

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('mensaje');
    });

    it('Si el bloque reservado no existe debe retornar error 404', async () => {
      jwt.verify.mockReturnValue({ id: 1, rol: 'ADMINISTRADOR' });
      mockPrisma.bloqueReservado.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get(
          '/api/bloque-reservado/550e8400-e29b-41d4-a716-446655440000/660e8400-e29b-41d4-a716-446655440111'
        )
        .set('Authorization', 'Bearer token_simulado');

      expect(response.status).toBe(404);
      expect(response.body.mensaje).toBe('Bloque reservado no encontrado');
    });

    it('Debe retornar 200 y el bloque reservado', async () => {
      jwt.verify.mockReturnValue({ id: 1, rol: 'ADMINISTRADOR' });

      mockPrisma.bloqueReservado.findUnique.mockResolvedValue({
        bloqueId: '550e8400-e29b-41d4-a716-446655440000',
        reservaId: '660e8400-e29b-41d4-a716-446655440111',
        bloque: {
          nroBloque: 1,
          horaInicio: '08:00',
          horaFin: '09:00',
        },
        reserva: { solicitanteNombre: 'Juan' },
      });

      const response = await request(app)
        .get(
          '/api/bloque-reservado/550e8400-e29b-41d4-a716-446655440000/660e8400-e29b-41d4-a716-446655440111'
        )
        .set('Authorization', 'Bearer token_simulado');

      expect(response.status).toBe(200);
      expect(response.body.mensaje).toBe(
        'Bloque reservado obtenido exitosamente'
      );
      expect(response.body.bloqueReservado.bloque.nroBloque).toBe(1);
    });
  });

  describe('POST /api/bloque-reservado/:bloqueId/verificar-disponibilidad', () => {
    it('Si no se envía token debe retornar error 401', async () => {
      const response = await request(app)
        .post(
          '/api/bloque-reservado/550e8400-e29b-41d4-a716-446655440000/verificar-disponibilidad'
        )
        .send({ fechaReserva: '2026-07-15T10:00:00Z' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('mensaje');
    });

    it('Debe retornar 200 y disponible=true si no hay conflictos', async () => {
      jwt.verify.mockReturnValue({ id: 1, rol: 'ADMINISTRADOR' });
      mockPrisma.bloqueReservado.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .post(
          '/api/bloque-reservado/550e8400-e29b-41d4-a716-446655440000/verificar-disponibilidad'
        )
        .set('Authorization', 'Bearer token_simulado')
        .send({ fechaReserva: '2026-07-15T10:00:00Z' });

      expect(response.status).toBe(200);
      expect(response.body.mensaje).toBe('Disponibilidad verificada');
      expect(response.body.disponible).toBe(true);
    });

    it('Debe retornar 200 y disponible=false si hay conflictos', async () => {
      jwt.verify.mockReturnValue({ id: 1, rol: 'ADMINISTRADOR' });
      mockPrisma.bloqueReservado.findFirst.mockResolvedValue({
        bloqueId: '550e8400-e29b-41d4-a716-446655440000',
        reservaId: '660e8400-e29b-41d4-a716-446655440111',
      });

      const response = await request(app)
        .post(
          '/api/bloque-reservado/550e8400-e29b-41d4-a716-446655440000/verificar-disponibilidad'
        )
        .set('Authorization', 'Bearer token_simulado')
        .send({ fechaReserva: '2026-07-15T10:00:00Z' });

      expect(response.status).toBe(200);
      expect(response.body.disponible).toBe(false);
    });
  });

  describe('DELETE /api/bloque-reservado/:bloqueId/:reservaId', () => {
    it('Si no se envía token debe retornar error 401', async () => {
      const response = await request(app).delete(
        '/api/bloque-reservado/550e8400-e29b-41d4-a716-446655440000/660e8400-e29b-41d4-a716-446655440111'
      );

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('mensaje');
    });

    it('Debe eliminar un bloque reservado correctamente', async () => {
      jwt.verify.mockReturnValue({ id: 1, rol: 'ADMINISTRADOR' });
      mockPrisma.bloqueReservado.delete.mockResolvedValue({
        bloqueId: '550e8400-e29b-41d4-a716-446655440000',
        reservaId: '660e8400-e29b-41d4-a716-446655440111',
      });

      const response = await request(app)
        .delete(
          '/api/bloque-reservado/550e8400-e29b-41d4-a716-446655440000/660e8400-e29b-41d4-a716-446655440111'
        )
        .set('Authorization', 'Bearer token_simulado');

      expect(response.status).toBe(200);
      expect(response.body.mensaje).toBe(
        'Bloque reservado eliminado exitosamente'
      );
    });
  });
});

describe('DELETE /api/bloque-reservado/reserva/:reservaId', () => {
  it('Si no se envía token debe retornar error 401', async () => {
    const response = await request(app).delete(
      '/api/bloque-reservado/reserva/660e8400-e29b-41d4-a716-446655440111'
    );

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('mensaje');
  });

  it('Debe eliminar los bloques de una reserva correctamente', async () => {
    jwt.verify.mockReturnValue({ id: 1, rol: 'ADMINISTRADOR' });
    mockPrisma.bloqueReservado.deleteMany.mockResolvedValue({ count: 2 });

    const response = await request(app)
      .delete(
        '/api/bloque-reservado/reserva/660e8400-e29b-41d4-a716-446655440111'
      )
      .set('Authorization', 'Bearer token_simulado');

    expect(response.status).toBe(200);
    expect(response.body.mensaje).toBe(
      'Bloques de la reserva eliminados exitosamente'
    );
  });
});
