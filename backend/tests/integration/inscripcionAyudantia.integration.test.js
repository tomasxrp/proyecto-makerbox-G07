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

describe('Prueba de integracion REAL API InscripcionAyudantia', () => {
  let adminToken;
  let estudianteToken;
  let adminUser;
  let estUser;
  let ayudantia;

  beforeEach(async () => {
    await prisma.inscripcionAyudantia.deleteMany();
    await prisma.ayudantia.deleteMany();
    await prisma.curso.deleteMany();
    await prisma.semestre.deleteMany();
    await prisma.usuario.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const pass = await bcrypt.hash('TestPass123', salt);

    adminUser = await prisma.usuario.create({
      data: {
        rut: 'ins-admin-1',
        nombre: 'Admin',
        apellido: 'Test',
        correo: 'adminins@test.com',
        passUsuario: pass,
        usuarioRol: 'ADMINISTRADOR',
      },
    });
    adminToken = jwt.sign(
      { id: adminUser.id, rol: adminUser.usuarioRol },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '24h' }
    );

    estUser = await prisma.usuario.create({
      data: {
        rut: 'ins-est-1',
        nombre: 'Estudiante',
        apellido: 'Test',
        correo: 'estins@test.com',
        passUsuario: pass,
        usuarioRol: 'ESTUDIANTE',
      },
    });
    estudianteToken = jwt.sign(
      { id: estUser.id, rol: estUser.usuarioRol },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '24h' }
    );

    const semestre = await prisma.semestre.create({
      data: {
        anio: 2026,
        periodo: 1,
        fechaInicio: new Date(),
        fechaFin: new Date(),
        estado: 'ACTIVO',
      },
    });

    const curso = await prisma.curso.create({
      data: {
        nombre: 'Curso Prueba',
        refProfesor: adminUser.id,
        refSemestre: semestre.id,
      },
    });

    ayudantia = await prisma.ayudantia.create({
      data: {
        nombreAyudantia: 'Ayudantia Prueba',
        refCurso: curso.id,
        refAyudante: adminUser.id,
        horario: new Date(),
        cupoMaximo: 10,
        estado: 'ACTIVA',
      },
    });
  });

  afterAll(async () => {
    const url = process.env.DATABASE_URL || '';
    if (!url.includes('supabase') && url.includes('localhost')) {
      await prisma.inscripcionAyudantia.deleteMany();
      await prisma.ayudantia.deleteMany();
      await prisma.curso.deleteMany();
      await prisma.semestre.deleteMany();
      await prisma.usuario.deleteMany();
    }
    await prisma.$disconnect();
  });

  describe('POST /api/inscripcion-ayudantia/crear', () => {
    it('Debe crear una inscripcion correctamente si es el mismo estudiante', async () => {
      const response = await request(app)
        .post('/api/inscripcion-ayudantia/crear')
        .set('Authorization', `Bearer ${estudianteToken}`)
        .send({
          refAyudantia: ayudantia.id,
          refEstudiante: estUser.id,
        });

      expect(response.status).toBe(200);
      expect(response.body.nuevaInscripcion.refAyudantia).toBe(ayudantia.id);
      expect(response.body.nuevaInscripcion.refEstudiante).toBe(estUser.id);
    });
  });

  describe('GET /api/inscripcion-ayudantia', () => {
    it('Debe obtener la lista de inscripciones', async () => {
      await prisma.inscripcionAyudantia.create({
        data: {
          refAyudantia: ayudantia.id,
          refEstudiante: estUser.id,
          estado: 'ASISTIO',
        },
      });

      const response = await request(app)
        .get('/api/inscripcion-ayudantia')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.inscripciones.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /api/inscripcion-ayudantia/:refAyudantia/:refEstudiante', () => {
    it('Debe actualizar el estado de la inscripción si es ADMIN', async () => {
      await prisma.inscripcionAyudantia.create({
        data: {
          refAyudantia: ayudantia.id,
          refEstudiante: estUser.id,
          estado: 'ASISTIO',
        },
      });
      const response = await request(app)
        .put(`/api/inscripcion-ayudantia/${ayudantia.id}/${estUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          refAyudantia: ayudantia.id,
          refEstudiante: estUser.id,
          estado: 'FALTO',
        });
      expect(response.status).toBe(200);
      expect(response.body.inscripcionActualizada.estado).toBe('FALTO');
    });
    it('No debe permitir actualizar si es ESTUDIANTE', async () => {
      await prisma.inscripcionAyudantia.create({
        data: {
          refAyudantia: ayudantia.id,
          refEstudiante: estUser.id,
          estado: 'ASISTIO',
        },
      });
      const response = await request(app)
        .put(`/api/inscripcion-ayudantia/${ayudantia.id}/${estUser.id}`)
        .set('Authorization', `Bearer ${estudianteToken}`)
        .send({
          refAyudantia: ayudantia.id,
          refEstudiante: estUser.id,
          estado: 'FALTO',
        });
      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/inscripcion-ayudantia/:refAyudantia/:refEstudiante', () => {
    it('Debe eliminar la inscripcion', async () => {
      await prisma.inscripcionAyudantia.create({
        data: {
          refAyudantia: ayudantia.id,
          refEstudiante: estUser.id,
        },
      });

      const response = await request(app)
        .delete(`/api/inscripcion-ayudantia/${ayudantia.id}/${estUser.id}`)
        .set('Authorization', `Bearer ${estudianteToken}`);

      expect(response.status).toBe(200);
      expect(response.body.inscripcionEliminada.refEstudiante).toBe(estUser.id);
    });
  });
});
