const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const request = require('supertest');
const app = require('../../src/index');

const prisma = new PrismaClient();

beforeAll(() => {
  const url = process.env.DATABASE_URL || '';
  if (url.includes('supabase') || !url.includes('localhost')) {
    throw new Error(
      'TESTS DE INTEGRACION DETENIDOS por intentar correrlos en la DB real.'
    );
  }
});

describe('Prueba de integración REAL API bloque reservado', () => {
  let adminToken;
  let adminUser;

  beforeEach(async () => {
    await prisma.bloqueReservado.deleteMany();
    await prisma.reserva.deleteMany();
    await prisma.bloqueHorario.deleteMany();
    await prisma.usuario.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const pass = await bcrypt.hash('TestPass123', salt);

    adminUser = await prisma.usuario.create({
      data: {
        rut: 'br-admin-9',
        nombre: 'Admin',
        apellido: 'Test',
        correo: 'adminbr@test.com',
        passUsuario: pass,
        usuarioRol: 'ADMINISTRADOR',
      },
    });
    adminToken = jwt.sign(
      { id: adminUser.id, rol: adminUser.usuarioRol },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '24h' }
    );
  });

  afterAll(async () => {
    const url = process.env.DATABASE_URL || '';
    if (!url.includes('supabase') && url.includes('localhost')) {
      await prisma.bloqueReservado.deleteMany();
      await prisma.reserva.deleteMany();
      await prisma.bloqueHorario.deleteMany();
      await prisma.usuario.deleteMany();
    }
    await prisma.$disconnect();
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
      const response = await request(app)
        .post('/api/bloque-reservado/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          bloqueId: '550e8400-e29b-41d4-a716-446655440000',
        });

      expect(response.status).toBe(400);
      expect(response.body.mensaje).toBe('El ID de la reserva es requerido');
    });

    it('Si los IDs no son UUID válidos debe retornar error 400', async () => {
      const response = await request(app)
        .post('/api/bloque-reservado/crear')
        .set('Authorization', `Bearer ${adminToken}`)
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
      const bloque = await prisma.bloqueHorario.create({
        data: { nroBloque: 1, horaInicio: '08:00', horaFin: '09:00' },
      });
      const reserva = await prisma.reserva.create({
        data: {
          fechaReserva: new Date(new Date().getTime() + 86400000),
          estadoReserva: 'PENDIENTE',
          solicitanteNombre: 'Juan',
          solicitanteApellido: 'Pérez',
          solicitanteCorreo: 'juan@test.com',
          solicitanteRut: '12345678-9',
          motivoReserva: 'Test',
        },
      });

      const response = await request(app)
        .post('/api/bloque-reservado/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          bloqueId: bloque.id,
          reservaId: reserva.id,
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
      const bloque = await prisma.bloqueHorario.create({
        data: { nroBloque: 1, horaInicio: '08:00', horaFin: '09:00' },
      });
      const reserva = await prisma.reserva.create({
        data: {
          fechaReserva: new Date(),
          solicitanteNombre: 'Juan',
          solicitanteApellido: 'Pérez',
          solicitanteCorreo: 'test@test.com',
          solicitanteRut: '12345678-9',
          motivoReserva: 'Test',
        },
      });
      await prisma.bloqueReservado.create({
        data: {
          bloqueId: bloque.id,
          reservaId: reserva.id,
        },
      });

      const response = await request(app)
        .get('/api/bloque-reservado/')
        .set('Authorization', `Bearer ${adminToken}`);

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
    });

    it('Debe retornar 200 y los bloques de una reserva', async () => {
      const bloque1 = await prisma.bloqueHorario.create({
        data: { nroBloque: 1, horaInicio: '08:00', horaFin: '09:00' },
      });
      const bloque2 = await prisma.bloqueHorario.create({
        data: { nroBloque: 2, horaInicio: '09:00', horaFin: '10:00' },
      });
      const reserva = await prisma.reserva.create({
        data: {
          fechaReserva: new Date(),
          solicitanteNombre: 'Juan',
          solicitanteApellido: 'Pérez',
          solicitanteCorreo: 'test@test.com',
          solicitanteRut: '12345678-9',
          motivoReserva: 'Test',
        },
      });
      await prisma.bloqueReservado.create({
        data: { bloqueId: bloque1.id, reservaId: reserva.id },
      });
      await prisma.bloqueReservado.create({
        data: { bloqueId: bloque2.id, reservaId: reserva.id },
      });

      const response = await request(app)
        .get(`/api/bloque-reservado/reserva/${reserva.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

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
    });

    it('Debe retornar 200 y las reservas de un bloque', async () => {
      const bloque = await prisma.bloqueHorario.create({
        data: { nroBloque: 1, horaInicio: '08:00', horaFin: '09:00' },
      });
      const reserva = await prisma.reserva.create({
        data: {
          fechaReserva: new Date(),
          solicitanteNombre: 'Juan',
          solicitanteApellido: 'Pérez',
          solicitanteCorreo: 'test@test.com',
          solicitanteRut: '12345678-9',
          motivoReserva: 'Test',
        },
      });
      await prisma.bloqueReservado.create({
        data: { bloqueId: bloque.id, reservaId: reserva.id },
      });

      const response = await request(app)
        .get(`/api/bloque-reservado/bloque/${bloque.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

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
    });

    it('Si el bloque reservado no existe debe retornar error 404', async () => {
      const response = await request(app)
        .get(
          '/api/bloque-reservado/550e8400-e29b-41d4-a716-446655440000/660e8400-e29b-41d4-a716-446655440111'
        )
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.mensaje).toBe('Bloque reservado no encontrado');
    });

    it('Debe retornar 200 y el bloque reservado', async () => {
      const bloque = await prisma.bloqueHorario.create({
        data: { nroBloque: 1, horaInicio: '08:00', horaFin: '09:00' },
      });
      const reserva = await prisma.reserva.create({
        data: {
          fechaReserva: new Date(),
          solicitanteNombre: 'Juan',
          solicitanteApellido: 'Pérez',
          solicitanteCorreo: 'test@test.com',
          solicitanteRut: '12345678-9',
          motivoReserva: 'Test',
        },
      });
      await prisma.bloqueReservado.create({
        data: { bloqueId: bloque.id, reservaId: reserva.id },
      });

      const response = await request(app)
        .get(`/api/bloque-reservado/${bloque.id}/${reserva.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

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
    });

    it('Debe retornar 200 y disponible=true si no hay conflictos', async () => {
      const bloque = await prisma.bloqueHorario.create({
        data: { nroBloque: 1, horaInicio: '08:00', horaFin: '09:00' },
      });

      const response = await request(app)
        .post(`/api/bloque-reservado/${bloque.id}/verificar-disponibilidad`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ fechaReserva: '2026-07-15T10:00:00Z' });

      expect(response.status).toBe(200);
      expect(response.body.disponible).toBe(true);
    });

    it('Debe retornar 200 y disponible=false si hay conflictos', async () => {
      const bloque = await prisma.bloqueHorario.create({
        data: { nroBloque: 1, horaInicio: '08:00', horaFin: '09:00' },
      });
      const fecha = new Date('2026-07-15T10:00:00Z');
      const reserva = await prisma.reserva.create({
        data: {
          fechaReserva: fecha,
          solicitanteNombre: 'Juan',
          solicitanteApellido: 'Pérez',
          solicitanteCorreo: 'test@test.com',
          solicitanteRut: '12345678-9',
          motivoReserva: 'Test',
          estadoReserva: 'CONFIRMADA',
        },
      });
      await prisma.bloqueReservado.create({
        data: { bloqueId: bloque.id, reservaId: reserva.id },
      });

      const response = await request(app)
        .post(`/api/bloque-reservado/${bloque.id}/verificar-disponibilidad`)
        .set('Authorization', `Bearer ${adminToken}`)
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
    });

    it('Debe eliminar un bloque reservado correctamente', async () => {
      const bloque = await prisma.bloqueHorario.create({
        data: { nroBloque: 1, horaInicio: '08:00', horaFin: '09:00' },
      });
      const reserva = await prisma.reserva.create({
        data: {
          fechaReserva: new Date(),
          solicitanteNombre: 'Juan',
          solicitanteApellido: 'Pérez',
          solicitanteCorreo: 'test@test.com',
          solicitanteRut: '12345678-9',
          motivoReserva: 'Test',
        },
      });
      await prisma.bloqueReservado.create({
        data: { bloqueId: bloque.id, reservaId: reserva.id },
      });

      const response = await request(app)
        .delete(`/api/bloque-reservado/${bloque.id}/${reserva.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.mensaje).toBe(
        'Bloque reservado eliminado exitosamente'
      );
    });
  });

  describe('DELETE /api/bloque-reservado/reserva/:reservaId', () => {
    it('Si no se envía token debe retornar error 401', async () => {
      const response = await request(app).delete(
        '/api/bloque-reservado/reserva/660e8400-e29b-41d4-a716-446655440111'
      );
      expect(response.status).toBe(401);
    });

    it('Debe eliminar los bloques de una reserva correctamente', async () => {
      const bloque = await prisma.bloqueHorario.create({
        data: { nroBloque: 1, horaInicio: '08:00', horaFin: '09:00' },
      });
      const reserva = await prisma.reserva.create({
        data: {
          fechaReserva: new Date(),
          solicitanteNombre: 'Juan',
          solicitanteApellido: 'Pérez',
          solicitanteCorreo: 'test@test.com',
          solicitanteRut: '12345678-9',
          motivoReserva: 'Test',
        },
      });
      await prisma.bloqueReservado.create({
        data: { bloqueId: bloque.id, reservaId: reserva.id },
      });

      const response = await request(app)
        .delete(`/api/bloque-reservado/reserva/${reserva.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.mensaje).toBe(
        'Bloques de la reserva eliminados exitosamente'
      );
    });
  });
});
