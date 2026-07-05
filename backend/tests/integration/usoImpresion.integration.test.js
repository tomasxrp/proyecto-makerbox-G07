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

describe('Pruebas de Integración REAL: API Uso de Impresión', () => {
  let adminToken;
  let studentToken;

  beforeEach(async () => {
    // Limpiar tablas
    const url = process.env.DATABASE_URL || '';
    if (!url.includes('supabase') && url.includes('localhost')) {
      await prisma.usoImpresion.deleteMany();
      await prisma.impresion.deleteMany();
      await prisma.articulo.deleteMany();
      await prisma.semestre.deleteMany();
      await prisma.usuario.deleteMany();
    }

    const salt = await bcrypt.genSalt(10);
    const pass = await bcrypt.hash('TestPass123', salt);

    // Crear admin
    const adminUser = await prisma.usuario.create({
      data: {
        rut: '12345678-1',
        nombre: 'Admin',
        apellido: 'Test',
        correo: 'adminuso@test.com',
        passUsuario: pass,
        usuarioRol: 'ADMINISTRADOR',
      },
    });
    adminToken = jwt.sign(
      { id: adminUser.id, rol: adminUser.usuarioRol },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '24h' }
    );

    // Crear estudiante
    const studentUser = await prisma.usuario.create({
      data: {
        rut: '12345678-2',
        nombre: 'Estudiante',
        apellido: 'Test',
        correo: 'estuso@test.com',
        passUsuario: pass,
        usuarioRol: 'ESTUDIANTE',
      },
    });
    studentToken = jwt.sign(
      { id: studentUser.id, rol: studentUser.usuarioRol },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '24h' }
    );
  });

  afterAll(async () => {
    const url = process.env.DATABASE_URL || '';
    if (!url.includes('supabase') && url.includes('localhost')) {
      await prisma.usoImpresion.deleteMany();
      await prisma.impresion.deleteMany();
      await prisma.articulo.deleteMany();
      await prisma.semestre.deleteMany();
      await prisma.usuario.deleteMany();
    }
    await prisma.$disconnect();
  });

  const createDependencies = async () => {
    const articulo = await prisma.articulo.create({
      data: { nombreArticulo: 'PLA Blanco', unidadMedida: 'gramos' },
    });
    const semestre = await prisma.semestre.create({
      data: {
        anio: 2026,
        periodo: 1,
        fechaInicio: new Date(),
        fechaFin: new Date(),
      },
    });
    const impresion = await prisma.impresion.create({
      data: {
        colorOpcion1: 'Blanco',
        colorOpcion2: 'Negro',
        colorOpcion3: 'Rojo',
        urlModelo3d: 'http://link1',
        urlModeloStl: 'http://link2',
        comentario: 'Test',
      },
    });
    return { articulo, semestre, impresion };
  };

  describe('POST /api/uso-impresion/crear', () => {
    it('Si no se proporciona token debe retornar 401', async () => {
      const response = await request(app)
        .post('/api/uso-impresion/crear')
        .send({
          refImpresion: 'imp-1',
          refSemestre: 'sem-1',
          cantidadFilamento: 50,
          refArticulo: 'art-1',
        });

      expect(response.status).toBe(401);
      expect(response.body.mensaje).toBe('Token no proporcionado');
    });

    it('Si faltan datos obligatorios debe retornar 400', async () => {
      const response = await request(app)
        .post('/api/uso-impresion/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ refImpresion: 'imp-1' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('mensaje');
    });

    it('Si cantidadFilamento no es entero debe retornar 400', async () => {
      const response = await request(app)
        .post('/api/uso-impresion/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          refImpresion: 'imp-1',
          refSemestre: 'sem-1',
          cantidadFilamento: 10.5,
          refArticulo: 'art-1',
        });

      expect(response.status).toBe(400);
      expect(response.body.mensaje).toBe(
        'La cantidad de filamento debe ser un número entero'
      );
    });

    it('Si cantidadFilamento es menor o igual a 0 debe retornar 400', async () => {
      const response = await request(app)
        .post('/api/uso-impresion/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          refImpresion: 'imp-1',
          refSemestre: 'sem-1',
          cantidadFilamento: 0,
          refArticulo: 'art-1',
        });

      expect(response.status).toBe(400);
      expect(response.body.mensaje).toBe(
        'La cantidad de filamento debe ser mayor a 0'
      );
    });

    it('Si el usuario no es ADMINISTRADOR ni AYUDANTE debe retornar 400', async () => {
      const response = await request(app)
        .post('/api/uso-impresion/crear')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          refImpresion: 'imp-1',
          refSemestre: 'sem-1',
          cantidadFilamento: 50,
          refArticulo: 'art-1',
        });

      expect(response.status).toBe(400);
      expect(response.body.mensaje).toBe(
        'Usuario no tiene los permisos necesarios.'
      );
    });

    it('Si la impresión no existe debe retornar 400', async () => {
      const { articulo, semestre } = await createDependencies();

      const response = await request(app)
        .post('/api/uso-impresion/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          refImpresion: 'inexistente',
          refSemestre: semestre.id,
          cantidadFilamento: 50,
          refArticulo: articulo.id,
        });

      expect(response.status).toBe(400);
      expect(response.body.mensaje).toBe(
        'La impresión no existe en la base de datos'
      );
    });

    it('Si el flujo completo es correcto debe retornar 201', async () => {
      const { articulo, semestre, impresion } = await createDependencies();

      const response = await request(app)
        .post('/api/uso-impresion/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          refImpresion: impresion.id,
          refSemestre: semestre.id,
          cantidadFilamento: 50,
          refArticulo: articulo.id,
        });

      expect(response.status).toBe(201);
      expect(response.body.mensaje).toBe(
        'Uso de impresión creado exitosamente'
      );
      expect(response.body.usoImpresion.refImpresion).toBe(impresion.id);
    });
  });

  describe('GET /api/uso-impresion/', () => {
    it('Si el flujo completo es correcto debe retornar 200 con datos de material', async () => {
      const { articulo, semestre, impresion } = await createDependencies();
      await prisma.usoImpresion.create({
        data: {
          refImpresion: impresion.id,
          refSemestre: semestre.id,
          cantidadFilamento: 50,
          refArticulo: articulo.id,
        },
      });

      const response = await request(app)
        .get('/api/uso-impresion/')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.usosImpresion).toHaveLength(1);
      expect(response.body.usosImpresion[0].cantidadFilamento).toBe(50);
      expect(response.body.usosImpresion[0].articulo.nombreArticulo).toBe(
        'PLA Blanco'
      );
    });
  });

  describe('GET /api/uso-impresion/:usoImpresionId', () => {
    it('Si el uso de impresión no existe debe retornar 404', async () => {
      const response = await request(app)
        .get('/api/uso-impresion/fake-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.mensaje).toBe(
        'El uso de impresión no existe en la base de datos'
      );
    });

    it('Si el flujo es correcto debe retornar 200 con datos de material', async () => {
      const { articulo, semestre, impresion } = await createDependencies();
      const uso = await prisma.usoImpresion.create({
        data: {
          refImpresion: impresion.id,
          refSemestre: semestre.id,
          cantidadFilamento: 50,
          refArticulo: articulo.id,
        },
      });

      const response = await request(app)
        .get(`/api/uso-impresion/${uso.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.usoImpresion.id).toBe(uso.id);
      expect(response.body.usoImpresion.cantidadFilamento).toBe(50);
    });
  });

  describe('PUT /api/uso-impresion/actualizar/:usoImpresionId', () => {
    it('Si el usuario no tiene permisos debe retornar 401', async () => {
      const response = await request(app)
        .put('/api/uso-impresion/actualizar/uso-1')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ cantidadFilamento: 100 });

      expect(response.status).toBe(401);
      expect(response.body.mensaje).toBe(
        'Usuario no tiene los permisos necesarios.'
      );
    });

    it('Si el uso de impresión no existe debe retornar 401', async () => {
      const response = await request(app)
        .put('/api/uso-impresion/actualizar/id-999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ cantidadFilamento: 100 });

      expect(response.status).toBe(401);
      expect(response.body.mensaje).toBe(
        'El uso de impresión no existe en la base de datos'
      );
    });

    it('Si el flujo es correcto debe retornar 200', async () => {
      const { articulo, semestre, impresion } = await createDependencies();
      const uso = await prisma.usoImpresion.create({
        data: {
          refImpresion: impresion.id,
          refSemestre: semestre.id,
          cantidadFilamento: 50,
          refArticulo: articulo.id,
        },
      });

      const response = await request(app)
        .put(`/api/uso-impresion/actualizar/${uso.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ cantidadFilamento: 100 });

      expect(response.status).toBe(200);
      expect(
        response.body.usoImpresionActualizado.usoImpresionActualizado
          .cantidadFilamento
      ).toBe(100);
    });
  });

  describe('DELETE /api/uso-impresion/eliminar/:usoImpresionId', () => {
    it('Si el usuario no tiene permisos debe retornar 401', async () => {
      const response = await request(app)
        .delete('/api/uso-impresion/eliminar/uso-1')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(401);
      expect(response.body.mensaje).toBe(
        'Usuario no tiene los permisos necesarios.'
      );
    });

    it('Si el uso de impresión no existe debe retornar 401', async () => {
      const response = await request(app)
        .delete('/api/uso-impresion/eliminar/id-999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(401);
      expect(response.body.mensaje).toBe(
        'El uso de impresión no existe en la base de datos'
      );
    });

    it('Si el flujo es correcto debe retornar 200', async () => {
      const { articulo, semestre, impresion } = await createDependencies();
      const uso = await prisma.usoImpresion.create({
        data: {
          refImpresion: impresion.id,
          refSemestre: semestre.id,
          cantidadFilamento: 50,
          refArticulo: articulo.id,
        },
      });

      const response = await request(app)
        .delete(`/api/uso-impresion/eliminar/${uso.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.usoImpresionEliminado.id).toBe(uso.id);
    });
  });

  describe('GET /api/uso-impresion/impresion/:impresionId', () => {
    it('Si el flujo es correcto debe retornar 200 con materiales ordenados por cantidad', async () => {
      const { articulo, semestre, impresion } = await createDependencies();

      const articulo2 = await prisma.articulo.create({
        data: { nombreArticulo: 'PETG Negro', unidadMedida: 'gramos' },
      });

      await prisma.usoImpresion.create({
        data: {
          refImpresion: impresion.id,
          refSemestre: semestre.id,
          cantidadFilamento: 80,
          refArticulo: articulo.id,
        },
      });

      await prisma.usoImpresion.create({
        data: {
          refImpresion: impresion.id,
          refSemestre: semestre.id,
          cantidadFilamento: 30,
          refArticulo: articulo2.id,
        },
      });

      const response = await request(app)
        .get(`/api/uso-impresion/impresion/${impresion.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.usosImpresion).toHaveLength(2);
      expect(response.body.usosImpresion[0].cantidadFilamento).toBe(80);
      expect(response.body.usosImpresion[0].articulo.nombreArticulo).toBe(
        'PLA Blanco'
      );
      expect(response.body.usosImpresion[1].cantidadFilamento).toBe(30);
    });
  });
});
