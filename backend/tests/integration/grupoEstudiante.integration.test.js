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

describe('Prueba de integracion REAL API GrupoEstudiante', () => {
  let profesorToken;
  let estudianteToken;
  let profesorUser;
  let estudianteUser;
  let estudianteUser2;
  let semestre;
  let curso;
  let grupo;

  beforeEach(async () => {
    await prisma.grupoEstudiante.deleteMany();
    await prisma.grupoCurso.deleteMany();
    await prisma.estudianteCurso.deleteMany();
    await prisma.curso.deleteMany();
    await prisma.semestre.deleteMany();
    await prisma.usuario.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const pass = await bcrypt.hash('TestPass123', salt);

    profesorUser = await prisma.usuario.create({
      data: {
        rut: 'ge-prof-9',
        nombre: 'Prof',
        apellido: 'Test',
        correo: 'profge@test.com',
        passUsuario: pass,
        usuarioRol: 'PROFESOR',
      },
    });
    profesorToken = jwt.sign(
      { id: profesorUser.id, rol: profesorUser.usuarioRol },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '24h' }
    );

    estudianteUser = await prisma.usuario.create({
      data: {
        rut: 'ge-est-9',
        nombre: 'Est',
        apellido: 'Test',
        correo: 'estge@test.com',
        passUsuario: pass,
        usuarioRol: 'ESTUDIANTE',
      },
    });
    estudianteToken = jwt.sign(
      { id: estudianteUser.id, rol: estudianteUser.usuarioRol },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '24h' }
    );

    estudianteUser2 = await prisma.usuario.create({
      data: {
        rut: 'ge-est-8',
        nombre: 'Est2',
        apellido: 'Test',
        correo: 'estge2@test.com',
        passUsuario: pass,
        usuarioRol: 'ESTUDIANTE',
      },
    });

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
        nombre: 'Curso GE',
        refProfesor: profesorUser.id,
        refSemestre: semestre.id,
      },
    });

    grupo = await prisma.grupoCurso.create({
      data: {
        refCurso: curso.id,
        nombreGrupo: 'Grupo 1',
      },
    });
  });

  afterAll(async () => {
    const url = process.env.DATABASE_URL || '';
    if (!url.includes('supabase') && url.includes('localhost')) {
      await prisma.grupoEstudiante.deleteMany();
      await prisma.grupoCurso.deleteMany();
      await prisma.estudianteCurso.deleteMany();
      await prisma.curso.deleteMany();
      await prisma.semestre.deleteMany();
      await prisma.usuario.deleteMany();
    }
    await prisma.$disconnect();
  });

  describe('POST /api/grupo-estudiante/asignar', () => {
    it('Si no se envia el token debe retornar error 401', async () => {
      const response = await request(app)
        .post('/api/grupo-estudiante/asignar')
        .send({
          refGrupo: grupo.id,
          refEstudiante: estudianteUser.id,
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('mensaje');
    });

    it('Cuando el usuario no tiene permisos (ej. ESTUDIANTE) debe retornar error 401', async () => {
      const response = await request(app)
        .post('/api/grupo-estudiante/asignar')
        .set('Authorization', `Bearer ${estudianteToken}`)
        .send({
          refGrupo: grupo.id,
          refEstudiante: estudianteUser.id,
        });

      expect(response.status).toBe(401);
      expect(response.body.mensaje).toBe(
        'Usuario no tiene los permisos necesarios.'
      );
    });

    it('Si faltan datos obligatorios debe retornar error 400', async () => {
      const response = await request(app)
        .post('/api/grupo-estudiante/asignar')
        .set('Authorization', `Bearer ${profesorToken}`)
        .send({
          refGrupo: grupo.id,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('mensaje');
    });

    it('Si todo el flujo es correcto debe retornar 201 y asignar el estudiante', async () => {
      const response = await request(app)
        .post('/api/grupo-estudiante/asignar')
        .set('Authorization', `Bearer ${profesorToken}`)
        .send({ refGrupo: grupo.id, refEstudiante: estudianteUser.id });

      expect(response.status).toBe(201);
      expect(response.body.mensaje).toBe(
        'Estudiante asignado al grupo exitosamente'
      );
      expect(response.body.asignacion.refGrupo).toBe(grupo.id);
      expect(response.body.asignacion.refEstudiante).toBe(estudianteUser.id);
    });
  });

  describe('GET /api/grupo-estudiante/grupo/:refGrupo', () => {
    it('Si el usuario tiene acceso debe retornar 200 y la lista de estudiantes', async () => {
      await prisma.grupoEstudiante.create({
        data: { refGrupo: grupo.id, refEstudiante: estudianteUser.id },
      });
      await prisma.grupoEstudiante.create({
        data: { refGrupo: grupo.id, refEstudiante: estudianteUser2.id },
      });

      const response = await request(app)
        .get(`/api/grupo-estudiante/grupo/${grupo.id}`)
        .set('Authorization', `Bearer ${profesorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.mensaje).toBe(
        'Estudiantes del grupo obtenidos con éxito'
      );
      expect(response.body.estudiantes).toHaveLength(2);
    });
  });

  describe('DELETE /api/grupo-estudiante/eliminar/:refGrupo/:refEstudiante', () => {
    it('Si el usuario no tiene permisos debe retornar 401', async () => {
      const response = await request(app)
        .delete(
          `/api/grupo-estudiante/eliminar/${grupo.id}/${estudianteUser.id}`
        )
        .set('Authorization', `Bearer ${estudianteToken}`);

      expect(response.status).toBe(401);
    });

    it('Si todo es correcto debe retornar 200 y eliminar la asignación', async () => {
      await prisma.grupoEstudiante.create({
        data: { refGrupo: grupo.id, refEstudiante: estudianteUser.id },
      });

      const response = await request(app)
        .delete(
          `/api/grupo-estudiante/eliminar/${grupo.id}/${estudianteUser.id}`
        )
        .set('Authorization', `Bearer ${profesorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.mensaje).toBe('Asignación eliminada con éxito');
    });
  });
});
