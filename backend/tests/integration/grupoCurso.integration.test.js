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

describe('Prueba de integracion REAL API GrupoCurso', () => {
  let profesorToken;
  let estudianteToken;
  let profesorUser;
  let semestre;
  let curso;

  beforeEach(async () => {
    await prisma.grupoEstudiante.deleteMany();
    await prisma.grupoCurso.deleteMany();
    await prisma.curso.deleteMany();
    await prisma.semestre.deleteMany();
    await prisma.usuario.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const pass = await bcrypt.hash('TestPass123', salt);

    profesorUser = await prisma.usuario.create({
      data: {
        rut: 'gc-prof-9',
        nombre: 'Profesor',
        apellido: 'Test',
        correo: 'profgc@test.com',
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
        rut: 'gc-est-9',
        nombre: 'Est',
        apellido: 'Test',
        correo: 'estgc@test.com',
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
        nombre: 'Curso de Prueba',
        refProfesor: profesorUser.id,
        refSemestre: semestre.id,
      },
    });
  });

  afterAll(async () => {
    const url = process.env.DATABASE_URL || '';
    if (!url.includes('supabase') && url.includes('localhost')) {
      await prisma.grupoEstudiante.deleteMany();
      await prisma.grupoCurso.deleteMany();
      await prisma.curso.deleteMany();
      await prisma.semestre.deleteMany();
      await prisma.usuario.deleteMany();
    }
    await prisma.$disconnect();
  });

  describe('POST /api/grupo-curso/crear', () => {
    it('Si no se envia el token debe retornar error 401', async () => {
      const response = await request(app).post('/api/grupo-curso/crear').send({
        refCurso: curso.id,
        nombreGrupo: 'Grupo 1',
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('mensaje');
    });

    it('Cuando el usuario no tiene permisos (ej. ESTUDIANTE) debe retornar error 401', async () => {
      const response = await request(app)
        .post('/api/grupo-curso/crear')
        .set('Authorization', `Bearer ${estudianteToken}`)
        .send({
          refCurso: curso.id,
          nombreGrupo: 'Grupo 1',
        });

      expect(response.status).toBe(401);
      expect(response.body.mensaje).toBe(
        'Usuario no tiene los permisos necesarios.'
      );
    });

    it('Si faltan datos obligatorios debe retornar error 400', async () => {
      const response = await request(app)
        .post('/api/grupo-curso/crear')
        .set('Authorization', `Bearer ${profesorToken}`)
        .send({
          refCurso: curso.id,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('mensaje');
    });

    it('Si todo el flujo es correcto debe retornar 201 y crear el grupo', async () => {
      const response = await request(app)
        .post('/api/grupo-curso/crear')
        .set('Authorization', `Bearer ${profesorToken}`)
        .send({ refCurso: curso.id, nombreGrupo: 'Grupo 1' });

      expect(response.status).toBe(201);
      expect(response.body.mensaje).toBe('Grupo creado exitosamente');
      expect(response.body.grupo.nombreGrupo).toBe('Grupo 1');
    });
  });

  describe('GET /api/grupo-curso/curso/:refCurso', () => {
    it('Si el usuario tiene acceso debe retornar 200 y la lista de grupos', async () => {
      await prisma.grupoCurso.create({
        data: {
          refCurso: curso.id,
          nombreGrupo: 'Grupo 1',
        },
      });

      const response = await request(app)
        .get(`/api/grupo-curso/curso/${curso.id}`)
        .set('Authorization', `Bearer ${profesorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.mensaje).toBe('Grupos obtenidos con éxito');
      expect(response.body.grupos).toHaveLength(1);
    });
  });

  describe('GET /api/grupo-curso/:id', () => {
    it('Si el grupo no existe debe retornar 401', async () => {
      const response = await request(app)
        .get('/api/grupo-curso/fake-id')
        .set('Authorization', `Bearer ${profesorToken}`);

      expect(response.status).toBe(401);
      expect(response.body.mensaje).toBe(
        'El grupo no existe en la base de datos'
      );
    });
  });

  describe('PUT /api/grupo-curso/:id', () => {
    it('Si el flujo es correcto debe actualizar el grupo', async () => {
      const grupo = await prisma.grupoCurso.create({
        data: {
          refCurso: curso.id,
          nombreGrupo: 'Viejo',
        },
      });

      const response = await request(app)
        .put(`/api/grupo-curso/${grupo.id}`)
        .set('Authorization', `Bearer ${profesorToken}`)
        .send({ nombreGrupo: 'Nuevo' });

      expect(response.status).toBe(200);
      expect(response.body.mensaje).toBe('Grupo actualizado con exito');
      expect(response.body.grupoActualizado.nombreGrupo).toBe('Nuevo');
    });
  });

  describe('DELETE /api/grupo-curso/:id', () => {
    it('Si todo es correcto debe retornar 200 y eliminar el grupo', async () => {
      const grupo = await prisma.grupoCurso.create({
        data: {
          refCurso: curso.id,
          nombreGrupo: 'Grupo 1',
        },
      });

      const response = await request(app)
        .delete(`/api/grupo-curso/${grupo.id}`)
        .set('Authorization', `Bearer ${profesorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.mensaje).toBe('Grupo eliminado con exito');
      expect(response.body.grupoEliminado.id).toBe(grupo.id);
    });
  });
});
