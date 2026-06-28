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

describe('Pruebas de Integración REAL: API Semestres', () => {
  let adminToken;
  let estudianteToken;

  beforeEach(async () => {
    await prisma.semestre.deleteMany();
    await prisma.usuario.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const pass = await bcrypt.hash('TestPass123', salt);

    const adminUser = await prisma.usuario.create({
      data: {
        rut: 'sem-admin-9',
        nombre: 'Admin',
        apellido: 'Test',
        correo: 'adminsem@test.com',
        passUsuario: pass,
        usuarioRol: 'ADMINISTRADOR',
      },
    });
    adminToken = jwt.sign(
      { id: adminUser.id, rol: adminUser.usuarioRol },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '24h' }
    );

    const estUser = await prisma.usuario.create({
      data: {
        rut: 'sem-est-9',
        nombre: 'Est',
        apellido: 'Test',
        correo: 'estsem@test.com',
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
    const url = process.env.DATABASE_URL || '';
    if (!url.includes('supabase') && url.includes('localhost')) {
      await prisma.semestre.deleteMany();
      await prisma.usuario.deleteMany();
    }
    await prisma.$disconnect();
  });

  describe('POST /api/semestre/crear', () => {
    it('Si faltan datos debe retornar 400', async () => {
      const response = await request(app)
        .post('/api/semestre/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ anio: 2026 }); // Faltan periodo, fechas

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('mensaje');
    });

    it('Si el usuario no es ADMINISTRADOR debe retornar 401', async () => {
      const response = await request(app)
        .post('/api/semestre/crear')
        .set('Authorization', `Bearer ${estudianteToken}`)
        .send({
          anio: 2026,
          periodo: 1,
          fechaInicio: '2026-03-01',
          fechaFin: '2026-07-15',
          estado: 'ACTIVO',
        });

      expect(response.status).toBe(401);
      expect(response.body.mensaje).toBe(
        'Usuario no tiene los permisos necesarios.'
      );
    });

    it('Si el flujo completo es correcto debe retornar 200', async () => {
      const response = await request(app)
        .post('/api/semestre/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          anio: 2026,
          periodo: 1,
          fechaInicio: '2026-03-01',
          fechaFin: '2026-07-15',
          estado: 'ACTIVO',
        });

      expect(response.status).toBe(200);
      expect(response.body.nuevoSemestre.mensaje).toBe(
        'Semestre creado con exito'
      );
      expect(response.body.nuevoSemestre.nuevoSemestre.anio).toBe(2026);
    });
  });

  describe('DELETE /api/semestre/eliminar/:semestreId', () => {
    it('Si el semestre no existe debe retornar 401 ', async () => {
      const response = await request(app)
        .delete('/api/semestre/eliminar/550e8400-e29b-41d4-a716-446655440000')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(401);
      expect(response.body.mensaje).toBe(
        'El semestre no existe en la base de datos'
      );
    });

    it('Si el flujo completo es correcto debe retornar 200 al eliminar con éxito', async () => {
      const semestre = await prisma.semestre.create({
        data: {
          anio: 2026,
          periodo: 1,
          fechaInicio: new Date('2026-03-01'),
          fechaFin: new Date('2026-07-15'),
          estado: 'ACTIVO',
        },
      });

      const response = await request(app)
        .delete(`/api/semestre/eliminar/${semestre.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.semestreEliminado.mensaje).toBe(
        'Semestre eliminado con exito'
      );
    });
  });

  describe('GET /api/semestre/', () => {
    it('Si el flujo completo es correcto debe retornar 200 y la lista de semestres', async () => {
      await prisma.semestre.create({
        data: {
          anio: 2026,
          periodo: 1,
          fechaInicio: new Date('2026-03-01'),
          fechaFin: new Date('2026-07-15'),
          estado: 'ACTIVO',
        },
      });
      await prisma.semestre.create({
        data: {
          anio: 2026,
          periodo: 2,
          fechaInicio: new Date('2026-08-01'),
          fechaFin: new Date('2026-12-15'),
          estado: 'INACTIVO',
        },
      });

      const response = await request(app).get('/api/semestre/');

      expect(response.status).toBe(200);
      expect(response.body.semestres).toHaveLength(2);
    });
  });
});
