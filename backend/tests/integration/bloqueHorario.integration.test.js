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

describe('Prueba de integración REAL API bloques horarios', () => {
  let adminToken;
  let profesorToken;
  let estudianteToken;

  beforeEach(async () => {
    await prisma.bloqueReservado.deleteMany();
    await prisma.bloqueHorario.deleteMany();
    await prisma.usuario.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const pass = await bcrypt.hash('TestPass123', salt);

    const adminUser = await prisma.usuario.create({
      data: {
        rut: 'bh-admin-9',
        nombre: 'Admin',
        apellido: 'Test',
        correo: 'adminbh@test.com',
        passUsuario: pass,
        usuarioRol: 'ADMINISTRADOR',
      },
    });
    adminToken = jwt.sign(
      { id: adminUser.id, rol: adminUser.usuarioRol },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '24h' }
    );

    const profesorUser = await prisma.usuario.create({
      data: {
        rut: 'bh-prof-9',
        nombre: 'Prof',
        apellido: 'Test',
        correo: 'profbh@test.com',
        passUsuario: pass,
        usuarioRol: 'PROFESOR',
      },
    });
    profesorToken = jwt.sign(
      { id: profesorUser.id, rol: profesorUser.usuarioRol },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '24h' }
    );

    const estUser = await prisma.usuario.create({
      data: {
        rut: 'bh-est-9',
        nombre: 'Est',
        apellido: 'Test',
        correo: 'estbh@test.com',
        passUsuario: pass,
        usuarioRol: 'ESTUDIANTE',
      },
    });
    estudianteToken = jwt.sign(
      { id: estUser.id, rol: estUser.usuarioRol },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '24h' }
    );
  });

  afterAll(async () => {
    await prisma.bloqueReservado.deleteMany();
    await prisma.bloqueHorario.deleteMany();
    await prisma.usuario.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/bloque-horario/crear', () => {
    it('Si no se envía token debe retornar error 401', async () => {
      const response = await request(app)
        .post('/api/bloque-horario/crear')
        .send({
          nroBloque: 1,
          horaInicio: '08:00',
          horaFin: '09:00',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('mensaje');
    });

    it('Si faltan datos obligatorios debe retornar error 400', async () => {
      const response = await request(app)
        .post('/api/bloque-horario/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nroBloque: 1,
        });

      expect(response.status).toBe(400);
      expect(response.body.mensaje).toBe('Todos los campos son obligatorios');
    });

    it('Si nroBloque no es entero debe retornar error 400', async () => {
      const response = await request(app)
        .post('/api/bloque-horario/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nroBloque: 1.5,
          horaInicio: '08:00',
          horaFin: '09:00',
        });

      expect(response.status).toBe(400);
      expect(response.body.mensaje).toBe(
        'Numero de bloque debe ser numero entero.'
      );
    });

    it('Si el formato de hora es inválido debe retornar error 400', async () => {
      const response = await request(app)
        .post('/api/bloque-horario/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nroBloque: 1,
          horaInicio: '8:00', // Formato inválido
          horaFin: '09:00',
        });

      expect(response.status).toBe(400);
      expect(response.body.mensaje).toBe('Formato de hora debe ser HH:MM');
    });

    it('Si el usuario no es ADMINISTRADOR debe retornar error 400', async () => {
      const response = await request(app)
        .post('/api/bloque-horario/crear')
        .set('Authorization', `Bearer ${estudianteToken}`)
        .send({
          nroBloque: 1,
          horaInicio: '08:00',
          horaFin: '09:00',
        });

      expect(response.status).toBe(400);
      expect(response.body.mensaje).toBe(
        'Usuario no tiene los permisos necesarios.'
      );
    });

    it('Si ya existe un bloque con el mismo nroBloque debe retornar error 400', async () => {
      await prisma.bloqueHorario.create({
        data: { nroBloque: 1, horaInicio: '08:00', horaFin: '09:00' },
      });

      const response = await request(app)
        .post('/api/bloque-horario/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nroBloque: 1,
          horaInicio: '08:00',
          horaFin: '09:00',
        });

      expect(response.status).toBe(400);
      expect(response.body.mensaje).toBe(
        'Ya existe un bloque horario con este número'
      );
    });

    it('Si todo es correcto debe retornar 202 y crear el bloque', async () => {
      const response = await request(app)
        .post('/api/bloque-horario/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nroBloque: 1,
          horaInicio: '08:00',
          horaFin: '09:00',
        });

      expect(response.status).toBe(202);
      expect(response.body.mensaje).toBe('Bloque horario creado exitosamente');
      expect(response.body.bloque.nroBloque).toBe(1);
    });
  });

  describe('GET /api/bloque-horario/', () => {
    it('Si no se envía token debe retornar error 401', async () => {
      const response = await request(app).get('/api/bloque-horario/');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('mensaje');
    });

    it('Si el usuario no es ADMINISTRADOR ni PROFESOR debe retornar error 401', async () => {
      const response = await request(app)
        .get('/api/bloque-horario/')
        .set('Authorization', `Bearer ${estudianteToken}`);

      expect(response.status).toBe(401);
      expect(response.body.mensaje).toBe(
        'Usuario no tiene los permisos necesarios.'
      );
    });

    it('Si el usuario es ADMINISTRADOR debe retornar 200 y los bloques', async () => {
      await prisma.bloqueHorario.create({
        data: { nroBloque: 1, horaInicio: '08:00', horaFin: '09:00' },
      });
      await prisma.bloqueHorario.create({
        data: { nroBloque: 2, horaInicio: '09:00', horaFin: '10:00' },
      });

      const response = await request(app)
        .get('/api/bloque-horario/')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.mensaje).toBe(
        'Bloques horarios obtenidos con exito'
      );
      expect(response.body.bloques).toHaveLength(2);
    });

    it('Si el usuario es PROFESOR debe retornar 200 y los bloques', async () => {
      await prisma.bloqueHorario.create({
        data: { nroBloque: 1, horaInicio: '08:00', horaFin: '09:00' },
      });

      const response = await request(app)
        .get('/api/bloque-horario/')
        .set('Authorization', `Bearer ${profesorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.bloques).toHaveLength(1);
    });
  });

  describe('GET /api/bloque-horario/:bloqueId', () => {
    it('Si no se envía token debe retornar error 401', async () => {
      const response = await request(app).get('/api/bloque-horario/123');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('mensaje');
    });

    it('Si el usuario no tiene permisos debe retornar error 401', async () => {
      const response = await request(app)
        .get('/api/bloque-horario/123')
        .set('Authorization', `Bearer ${estudianteToken}`);

      expect(response.status).toBe(401);
      expect(response.body.mensaje).toBe(
        'Usuario no tiene los permisos necesarios.'
      );
    });

    it('Si el bloque no existe debe retornar error 401', async () => {
      const response = await request(app)
        .get('/api/bloque-horario/fake-id')
        .set('Authorization', `Bearer ${profesorToken}`);

      expect(response.status).toBe(401); // original test expected 401 based on middleware? Actually originally it mocked null so yes
      expect(response.body.mensaje).toBe(
        'El bloque horario no existe en la base de datos'
      );
    });

    it('Si todo es correcto debe retornar 200 y el bloque', async () => {
      const bloque = await prisma.bloqueHorario.create({
        data: { nroBloque: 1, horaInicio: '08:00', horaFin: '09:00' },
      });

      const response = await request(app)
        .get(`/api/bloque-horario/${bloque.id}`)
        .set('Authorization', `Bearer ${profesorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.mensaje).toBe('Bloque horario obtenido con exito');
      expect(response.body.bloque.nroBloque).toBe(1);
    });
  });

  describe('PUT /api/bloque-horario/actualizar/:bloqueId', () => {
    it('Si no se envía token debe retornar error 401', async () => {
      const response = await request(app)
        .put('/api/bloque-horario/actualizar/123')
        .send({ nroBloque: 2, horaInicio: '09:00', horaFin: '10:00' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('mensaje');
    });

    it('Si el usuario no es ADMINISTRADOR debe retornar error 401', async () => {
      const response = await request(app)
        .put('/api/bloque-horario/actualizar/123')
        .set('Authorization', `Bearer ${profesorToken}`)
        .send({ nroBloque: 2, horaInicio: '09:00', horaFin: '10:00' });

      expect(response.status).toBe(401);
      expect(response.body.mensaje).toBe(
        'Usuario no tiene los permisos necesarios.'
      );
    });

    it('Si faltan datos debe retornar error 400', async () => {
      const response = await request(app)
        .put('/api/bloque-horario/actualizar/123')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nroBloque: 2 });

      expect(response.status).toBe(400);
      expect(response.body.mensaje).toBe('Todos los campos son obligatorios');
    });

    it('Si el bloque no existe debe retornar error 401', async () => {
      const response = await request(app)
        .put('/api/bloque-horario/actualizar/fake-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nroBloque: 2, horaInicio: '09:00', horaFin: '10:00' });

      expect(response.status).toBe(401);
      expect(response.body.mensaje).toBe(
        'El bloque horario no existe en la base de datos'
      );
    });

    it('Si todo es correcto debe retornar 200 y el bloque actualizado', async () => {
      const bloque = await prisma.bloqueHorario.create({
        data: { nroBloque: 1, horaInicio: '08:00', horaFin: '09:00' },
      });

      const response = await request(app)
        .put(`/api/bloque-horario/actualizar/${bloque.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nroBloque: 2, horaInicio: '09:00', horaFin: '10:00' });

      expect(response.status).toBe(200);
      expect(response.body.mensaje).toBe(
        'Bloque horario actualizado con exito'
      );
      expect(response.body.bloque.nroBloque).toBe(2);
    });
  });

  describe('DELETE /api/bloque-horario/eliminar/:bloqueId', () => {
    it('Si no se envía token debe retornar error 401', async () => {
      const response = await request(app).delete(
        '/api/bloque-horario/eliminar/123'
      );

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('mensaje');
    });

    it('Si el usuario no es ADMINISTRADOR debe retornar error 401', async () => {
      const response = await request(app)
        .delete('/api/bloque-horario/eliminar/123')
        .set('Authorization', `Bearer ${profesorToken}`);

      expect(response.status).toBe(401);
      expect(response.body.mensaje).toBe(
        'Usuario no tiene los permisos necesarios.'
      );
    });

    it('Si el bloque no existe debe retornar error 401', async () => {
      const response = await request(app)
        .delete('/api/bloque-horario/eliminar/fake-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(401);
      expect(response.body.mensaje).toBe(
        'El bloque horario no existe en la base de datos'
      );
    });

    it('Si todo es correcto debe retornar 200 y eliminar el bloque', async () => {
      const bloque = await prisma.bloqueHorario.create({
        data: { nroBloque: 1, horaInicio: '08:00', horaFin: '09:00' },
      });

      const response = await request(app)
        .delete(`/api/bloque-horario/eliminar/${bloque.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.mensaje).toBe('Bloque horario eliminado con exito');
      expect(response.body.bloque.nroBloque).toBe(1);
    });
  });
});
