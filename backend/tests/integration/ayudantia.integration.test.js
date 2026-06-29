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

describe('Prueba de integracion REAL API Ayudantia', () => {
  let adminToken;
  let ayudanteToken;
  let estudianteToken;
  let adminUser;
  let ayudanteUser;
  let semestre;
  let curso;

  beforeEach(async () => {
    // Eliminar en orden inverso de dependencias
    await prisma.inscripcionAyudantia.deleteMany();
    await prisma.ayudantia.deleteMany();
    await prisma.grupoCurso.deleteMany();
    await prisma.curso.deleteMany();
    await prisma.semestre.deleteMany();
    await prisma.usuario.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const pass = await bcrypt.hash('TestPass123', salt);

    adminUser = await prisma.usuario.create({
      data: {
        rut: 'ayu-admin-9',
        nombre: 'Admin',
        apellido: 'Test',
        correo: 'adminayu@test.com',
        passUsuario: pass,
        usuarioRol: 'ADMINISTRADOR',
      },
    });
    adminToken = jwt.sign(
      { id: adminUser.id, rol: adminUser.usuarioRol },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '24h' }
    );

    ayudanteUser = await prisma.usuario.create({
      data: {
        rut: 'ayu-ayud-9',
        nombre: 'Ayudante',
        apellido: 'Test',
        correo: 'ayudanteayu@test.com',
        passUsuario: pass,
        usuarioRol: 'AYUDANTE',
      },
    });
    ayudanteToken = jwt.sign(
      { id: ayudanteUser.id, rol: ayudanteUser.usuarioRol },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '24h' }
    );

    const estUser = await prisma.usuario.create({
      data: {
        rut: 'ayu-est-9',
        nombre: 'Est',
        apellido: 'Test',
        correo: 'estayu@test.com',
        passUsuario: pass,
        usuarioRol: 'ESTUDIANTE',
      },
    });
    estudianteToken = jwt.sign(
      { id: estUser.id, rol: estUser.usuarioRol },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '24h' }
    );

    semestre = await prisma.semestre.create({
      data: {
        anio: 2026,
        periodo: 1,
        fechaInicio: new Date('2026-03-01'),
        fechaFin: new Date('2026-07-15'),
        estado: 'ACTIVO',
      },
    });

    curso = await prisma.curso.create({
      data: {
        nombre: 'Curso de Prueba Ayudantia',
        refProfesor: adminUser.id, // Reutilizamos al admin como profe por simplicidad
        refSemestre: semestre.id,
      },
    });
  });

  afterAll(async () => {
    const url = process.env.DATABASE_URL || '';
    if (!url.includes('supabase') && url.includes('localhost')) {
      await prisma.inscripcionAyudantia.deleteMany();
      await prisma.ayudantia.deleteMany();
      await prisma.grupoCurso.deleteMany();
      await prisma.curso.deleteMany();
      await prisma.semestre.deleteMany();
      await prisma.usuario.deleteMany();
    }
    await prisma.$disconnect();
  });

  describe('POST /api/ayudantia/crear', () => {
    it('Si no se envia el token debe retornar error 401', async () => {
      const response = await request(app)
        .post('/api/ayudantia/crear')
        .send({
          nombreAyudantia: 'Repaso 1',
          refCurso: curso.id,
          refAyudante: ayudanteUser.id,
          horario: new Date('2026-07-15T15:00:00Z').toISOString(),
          cupoMaximo: 20,
          estado: 'ACTIVA',
        });
      expect(response.status).toBe(401);
    });

    it('Si un estudiante intenta crear una ayudantia debe retornar error 401 (sin permisos)', async () => {
      const response = await request(app)
        .post('/api/ayudantia/crear')
        .set('Authorization', `Bearer ${estudianteToken}`)
        .send({
          nombreAyudantia: 'Repaso 1',
          refCurso: curso.id,
          refAyudante: ayudanteUser.id,
          horario: new Date('2026-07-15T15:00:00Z').toISOString(),
          cupoMaximo: 20,
          estado: 'ACTIVA',
        });
      expect(response.status).toBe(401);
    });

    it('Si los datos son correctos (Admin) debe crear la ayudantia', async () => {
      const response = await request(app)
        .post('/api/ayudantia/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombreAyudantia: 'Repaso 1',
          refCurso: curso.id,
          refAyudante: ayudanteUser.id,
          horario: new Date('2026-07-15T15:00:00Z').toISOString(),
          cupoMaximo: 20,
          estado: 'ACTIVA',
        });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('nuevaAyudantia');
      expect(response.body.nuevaAyudantia.nombreAyudantia).toBe('Repaso 1');
    });
  });

  describe('GET /api/ayudantia', () => {
    it('Debe obtener la lista de ayudantias (ESTUDIANTE)', async () => {
      await prisma.ayudantia.create({
        data: {
          nombreAyudantia: 'Ayudantia Get Estudiante',
          refCurso: curso.id,
          refAyudante: ayudanteUser.id,
          horario: new Date('2026-07-15T15:00:00Z'),
          cupoMaximo: 10,
          estado: 'ACTIVA',
        },
      });

      const response = await request(app)
        .get('/api/ayudantia')
        .set('Authorization', `Bearer ${estudianteToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.ayudantias)).toBe(true);
      expect(response.body.ayudantias.length).toBeGreaterThan(0);
      expect(response.body.ayudantias[0].nombreAyudantia).toBe(
        'Ayudantia Get Estudiante'
      );
    });

    it('Debe obtener la lista de ayudantias (AYUDANTE)', async () => {
      await prisma.ayudantia.create({
        data: {
          nombreAyudantia: 'Ayudantia Get Ayudante',
          refCurso: curso.id,
          refAyudante: ayudanteUser.id,
          horario: new Date('2026-07-15T15:00:00Z'),
          cupoMaximo: 10,
          estado: 'ACTIVA',
        },
      });

      const response = await request(app)
        .get('/api/ayudantia')
        .set('Authorization', `Bearer ${ayudanteToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.ayudantias)).toBe(true);
      expect(response.body.ayudantias.length).toBeGreaterThan(0);
      expect(response.body.ayudantias[0].nombreAyudantia).toBe(
        'Ayudantia Get Ayudante'
      );
    });
  });

  describe('GET /api/ayudantia/:ayudantiaId', () => {
    it('Debe obtener una ayudantia especifica', async () => {
      const ayudantia = await prisma.ayudantia.create({
        data: {
          nombreAyudantia: 'Ayudantia Unica',
          refCurso: curso.id,
          refAyudante: ayudanteUser.id,
          horario: new Date('2026-07-15T15:00:00Z'),
          cupoMaximo: 15,
          estado: 'ACTIVA',
        },
      });

      const response = await request(app)
        .get(`/api/ayudantia/${ayudantia.id}`)
        .set('Authorization', `Bearer ${estudianteToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ayudantia.nombreAyudantia).toBe('Ayudantia Unica');
    });
  });

  describe('PUT /api/ayudantia/:ayudantiaId', () => {
    it('Debe actualizar los datos de una ayudantia (Admin)', async () => {
      const ayudantia = await prisma.ayudantia.create({
        data: {
          nombreAyudantia: 'Ayudantia Vieja',
          refCurso: curso.id,
          refAyudante: ayudanteUser.id,
          horario: new Date('2026-07-15T15:00:00Z'),
          cupoMaximo: 15,
          estado: 'ACTIVA',
        },
      });

      const response = await request(app)
        .put(`/api/ayudantia/${ayudantia.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombreAyudantia: 'Ayudantia Actualizada',
          refCurso: curso.id,
          refAyudante: ayudanteUser.id,
          horario: new Date('2026-07-15T15:00:00Z').toISOString(),
          cupoMaximo: 30,
          estado: 'ACTIVA',
        });

      expect(response.status).toBe(200);
      expect(response.body.ayudantiaActualizada.nombreAyudantia).toBe(
        'Ayudantia Actualizada'
      );
      expect(response.body.ayudantiaActualizada.cupoMaximo).toBe(30);
    });
  });

  describe('DELETE /api/ayudantia/:ayudantiaId', () => {
    it('Debe eliminar una ayudantia (Admin)', async () => {
      const ayudantia = await prisma.ayudantia.create({
        data: {
          nombreAyudantia: 'Ayudantia a Borrar',
          refCurso: curso.id,
          refAyudante: ayudanteUser.id,
          horario: new Date('2026-07-15T15:00:00Z'),
          cupoMaximo: 15,
          estado: 'ACTIVA',
        },
      });

      const response = await request(app)
        .delete(`/api/ayudantia/${ayudantia.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ayudantiaEliminada.nombreAyudantia).toBe(
        'Ayudantia a Borrar'
      );
    });
  });
});
