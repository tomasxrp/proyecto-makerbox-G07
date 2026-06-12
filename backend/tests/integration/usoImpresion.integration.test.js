// eslint-disable-next-line
const mockPrisma = require('../prismaMock');

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/index');

jest.mock('jsonwebtoken');

describe('Pruebas de Integración: API Uso de Impresión', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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
      jwt.verify.mockReturnValue({ id: 'user-1', rol: 'ADMINISTRADOR' });

      const response = await request(app)
        .post('/api/uso-impresion/crear')
        .set('Authorization', 'Bearer token_simulado')
        .send({ refImpresion: 'imp-1' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('mensaje');
    });

    it('Si cantidadFilamento no es entero debe retornar 400', async () => {
      jwt.verify.mockReturnValue({ id: 'user-1', rol: 'ADMINISTRADOR' });

      const response = await request(app)
        .post('/api/uso-impresion/crear')
        .set('Authorization', 'Bearer token_simulado')
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
      jwt.verify.mockReturnValue({ id: 'user-1', rol: 'ADMINISTRADOR' });

      const response = await request(app)
        .post('/api/uso-impresion/crear')
        .set('Authorization', 'Bearer token_simulado')
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
      jwt.verify.mockReturnValue({ id: 'user-1', rol: 'ESTUDIANTE' });

      const response = await request(app)
        .post('/api/uso-impresion/crear')
        .set('Authorization', 'Bearer token_simulado')
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
      jwt.verify.mockReturnValue({ id: 'user-1', rol: 'ADMINISTRADOR' });
      mockPrisma.impresion.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/uso-impresion/crear')
        .set('Authorization', 'Bearer token_simulado')
        .send({
          refImpresion: 'imp-inexistente',
          refSemestre: 'sem-1',
          cantidadFilamento: 50,
          refArticulo: 'art-1',
        });

      expect(response.status).toBe(400);
      expect(response.body.mensaje).toBe(
        'La impresión no existe en la base de datos'
      );
    });

    it('Si el flujo completo es correcto debe retornar 201', async () => {
      jwt.verify.mockReturnValue({ id: 'user-1', rol: 'ADMINISTRADOR' });

      mockPrisma.impresion.findUnique.mockResolvedValue({ id: 'imp-1' });
      mockPrisma.semestre.findUnique.mockResolvedValue({ id: 'sem-1' });
      mockPrisma.articulo.findUnique.mockResolvedValue({ id: 'art-1' });
      mockPrisma.usoImpresion.create.mockResolvedValue({
        id: 'uso-1',
        refImpresion: 'imp-1',
        refSemestre: 'sem-1',
        cantidadFilamento: 50,
        refArticulo: 'art-1',
        creadoEn: new Date(),
      });

      const response = await request(app)
        .post('/api/uso-impresion/crear')
        .set('Authorization', 'Bearer token_simulado')
        .send({
          refImpresion: 'imp-1',
          refSemestre: 'sem-1',
          cantidadFilamento: 50,
          refArticulo: 'art-1',
        });

      expect(response.status).toBe(201);
      expect(response.body.mensaje).toBe(
        'Uso de impresión creado exitosamente'
      );
      expect(response.body.usoImpresion.id).toBe('uso-1');
    });
  });

  describe('GET /api/uso-impresion/', () => {
    it('Si el flujo completo es correcto debe retornar 200 con datos de material', async () => {
      jwt.verify.mockReturnValue({ id: 'user-1', rol: 'ADMINISTRADOR' });
      mockPrisma.usoImpresion.findMany.mockResolvedValue([
        {
          id: 'uso-1',
          cantidadFilamento: 50,
          refArticulo: 'art-1',
          impresion: { id: 'imp-1', estado: 'PENDIENTE' },
          articulo: {
            id: 'art-1',
            nombreArticulo: 'PLA Blanco',
            unidadMedida: 'gramos',
          },
          solicitante: {
            id: 'sol-1',
            nombre: 'Juan',
            apellido: 'Pérez',
            correo: 'juan@test.com',
            rut: '12345678-9',
          },
          estudiante: null,
        },
        {
          id: 'uso-2',
          cantidadFilamento: 30,
          refArticulo: 'art-2',
          impresion: { id: 'imp-2', estado: 'EN_PROCESO' },
          articulo: {
            id: 'art-2',
            nombreArticulo: 'PETG Negro',
            unidadMedida: 'gramos',
          },
          solicitante: null,
          estudiante: null,
        },
      ]);
      const response = await request(app)
        .get('/api/uso-impresion/')
        .set('Authorization', 'Bearer token_simulado');
      expect(response.status).toBe(200);
      expect(response.body.usosImpresion).toHaveLength(2);
      expect(response.body.usosImpresion[0].cantidadFilamento).toBe(50);
      expect(response.body.usosImpresion[0].refArticulo).toBe('art-1');
      expect(response.body.usosImpresion[0].articulo.nombreArticulo).toBe(
        'PLA Blanco'
      );
      expect(response.body.usosImpresion[1].cantidadFilamento).toBe(30);
      expect(response.body.usosImpresion[1].articulo.nombreArticulo).toBe(
        'PETG Negro'
      );
    });
  });

  describe('GET /api/uso-impresion/:usoImpresionId', () => {
    it('Si el uso de impresión no existe debe retornar 404', async () => {
      jwt.verify.mockReturnValue({ id: 'user-1', rol: 'ADMINISTRADOR' });
      mockPrisma.usoImpresion.findUnique.mockResolvedValue(null);
      const response = await request(app)
        .get('/api/uso-impresion/id-inexistente')
        .set('Authorization', 'Bearer token_simulado');
      expect(response.status).toBe(404);
      expect(response.body.mensaje).toBe(
        'El uso de impresión no existe en la base de datos'
      );
    });
    it('Si el flujo es correcto debe retornar 200 con datos de material', async () => {
      jwt.verify.mockReturnValue({ id: 'user-1', rol: 'ADMINISTRADOR' });
      mockPrisma.usoImpresion.findUnique.mockResolvedValue({
        id: 'uso-1',
        refImpresion: 'imp-1',
        cantidadFilamento: 50,
        impresion: { id: 'imp-1', estado: 'PENDIENTE' },
        articulo: {
          id: 'art-1',
          nombreArticulo: 'PLA Blanco',
          unidadMedida: 'gramos',
        },
        solicitante: {
          id: 'sol-1',
          nombre: 'Juan',
          apellido: 'Pérez',
          correo: 'juan@test.com',
          rut: '12345678-9',
        },
        estudiante: null,
      });
      const response = await request(app)
        .get('/api/uso-impresion/uso-1')
        .set('Authorization', 'Bearer token_simulado');
      expect(response.status).toBe(200);
      expect(response.body.usoImpresion.id).toBe('uso-1');
      expect(response.body.usoImpresion.articulo.nombreArticulo).toBe(
        'PLA Blanco'
      );
      expect(response.body.usoImpresion.cantidadFilamento).toBe(50);
      expect(response.body.usoImpresion.impresion.id).toBe('imp-1');
      expect(response.body.usoImpresion.solicitante.nombre).toBe('Juan');
    });
  });

  describe('PUT /api/uso-impresion/actualizar/:usoImpresionId', () => {
    it('Si el usuario no tiene permisos debe retornar 401', async () => {
      jwt.verify.mockReturnValue({ id: 'user-1', rol: 'ESTUDIANTE' });

      const response = await request(app)
        .put('/api/uso-impresion/actualizar/uso-1')
        .set('Authorization', 'Bearer token_simulado')
        .send({ cantidadFilamento: 100 });

      expect(response.status).toBe(401);
      expect(response.body.mensaje).toBe(
        'Usuario no tiene los permisos necesarios.'
      );
    });

    it('Si el uso de impresión no existe debe retornar 401', async () => {
      jwt.verify.mockReturnValue({ id: 'user-1', rol: 'ADMINISTRADOR' });

      mockPrisma.usoImpresion.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/uso-impresion/actualizar/id-999')
        .set('Authorization', 'Bearer token_simulado')
        .send({ cantidadFilamento: 100 });

      expect(response.status).toBe(401);
      expect(response.body.mensaje).toBe(
        'El uso de impresión no existe en la base de datos'
      );
    });

    it('Si el flujo es correcto debe retornar 200', async () => {
      jwt.verify.mockReturnValue({ id: 'user-1', rol: 'ADMINISTRADOR' });

      mockPrisma.usoImpresion.findUnique.mockResolvedValue({
        id: 'uso-1',
        cantidadFilamento: 50,
      });
      mockPrisma.usoImpresion.update.mockResolvedValue({
        id: 'uso-1',
        cantidadFilamento: 100,
      });

      const response = await request(app)
        .put('/api/uso-impresion/actualizar/uso-1')
        .set('Authorization', 'Bearer token_simulado')
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
      jwt.verify.mockReturnValue({ id: 'user-1', rol: 'ESTUDIANTE' });

      const response = await request(app)
        .delete('/api/uso-impresion/eliminar/uso-1')
        .set('Authorization', 'Bearer token_simulado');

      expect(response.status).toBe(401);
      expect(response.body.mensaje).toBe(
        'Usuario no tiene los permisos necesarios.'
      );
    });

    it('Si el uso de impresión no existe debe retornar 401', async () => {
      jwt.verify.mockReturnValue({ id: 'user-1', rol: 'ADMINISTRADOR' });

      mockPrisma.usoImpresion.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/uso-impresion/eliminar/id-999')
        .set('Authorization', 'Bearer token_simulado');

      expect(response.status).toBe(401);
      expect(response.body.mensaje).toBe(
        'El uso de impresión no existe en la base de datos'
      );
    });

    it('Si el flujo es correcto debe retornar 200', async () => {
      jwt.verify.mockReturnValue({ id: 'user-1', rol: 'ADMINISTRADOR' });

      mockPrisma.usoImpresion.findUnique.mockResolvedValue({
        id: 'uso-1',
        cantidadFilamento: 50,
      });
      mockPrisma.usoImpresion.delete.mockResolvedValue({
        id: 'uso-1',
        cantidadFilamento: 50,
      });

      const response = await request(app)
        .delete('/api/uso-impresion/eliminar/uso-1')
        .set('Authorization', 'Bearer token_simulado');

      expect(response.status).toBe(200);
      expect(response.body.usoImpresionEliminado.id).toBe('uso-1');
    });
  });

  describe('GET /api/uso-impresion/impresion/:impresionId', () => {
    it('Si el flujo es correcto debe retornar 200 con materiales ordenados por cantidad', async () => {
      jwt.verify.mockReturnValue({ id: 'user-1', rol: 'ADMINISTRADOR' });
      mockPrisma.usoImpresion.findMany.mockResolvedValue([
        {
          id: 'uso-1',
          refImpresion: 'imp-1',
          cantidadFilamento: 80,
          articulo: {
            id: 'art-1',
            nombreArticulo: 'PLA Blanco',
            unidadMedida: 'gramos',
          },
          solicitante: {
            id: 'sol-1',
            nombre: 'Juan',
            apellido: 'Pérez',
            correo: 'juan@test.com',
            rut: '12345678-9',
          },
          estudiante: null,
        },
        {
          id: 'uso-2',
          refImpresion: 'imp-1',
          cantidadFilamento: 30,
          articulo: {
            id: 'art-2',
            nombreArticulo: 'PETG Negro',
            unidadMedida: 'gramos',
          },
          solicitante: null,
          estudiante: null,
        },
      ]);
      const response = await request(app)
        .get('/api/uso-impresion/impresion/imp-1')
        .set('Authorization', 'Bearer token_simulado');
      expect(response.status).toBe(200);
      expect(response.body.usosImpresion).toHaveLength(2);
      expect(response.body.usosImpresion[0].cantidadFilamento).toBe(80);
      expect(response.body.usosImpresion[0].articulo.nombreArticulo).toBe(
        'PLA Blanco'
      );
      expect(response.body.usosImpresion[1].cantidadFilamento).toBe(30);
      expect(response.body.usosImpresion[0].cantidadFilamento).toBeGreaterThan(
        response.body.usosImpresion[1].cantidadFilamento
      );
    });
  });
});
