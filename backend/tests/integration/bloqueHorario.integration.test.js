// backend/tests/integration/bloqueHorario.integration.test.js
// eslint-disable-next-line
const mockPrisma = require('../prismaMock');

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/index');

jest.mock('jsonwebtoken');

describe('Prueba de integración API bloques horarios', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
      jwt.verify.mockReturnValue({ id: 1, rol: 'ADMINISTRADOR' });

      const response = await request(app)
        .post('/api/bloque-horario/crear')
        .set('Authorization', 'Bearer token_simulado_admin')
        .send({
          nroBloque: 1,
          // Falta horaInicio y horaFin
        });

      expect(response.status).toBe(400);
      expect(response.body.mensaje).toBe(
        'Todos los campos son obligatorios'
      );
    });

    it('Si nroBloque no es entero debe retornar error 400', async () => {
      jwt.verify.mockReturnValue({ id: 1, rol: 'ADMINISTRADOR' });

      const response = await request(app)
        .post('/api/bloque-horario/crear')
        .set('Authorization', 'Bearer token_simulado_admin')
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
      jwt.verify.mockReturnValue({ id: 1, rol: 'ADMINISTRADOR' });

      const response = await request(app)
        .post('/api/bloque-horario/crear')
        .set('Authorization', 'Bearer token_simulado_admin')
        .send({
          nroBloque: 1,
          horaInicio: '8:00', // Formato inválido
          horaFin: '09:00',
        });

      expect(response.status).toBe(400);
      expect(response.body.mensaje).toBe(
        'Formato de hora debe ser HH:MM'
      );
    });

    it('Si el usuario no es ADMINISTRADOR debe retornar error 400', async () => {
      jwt.verify.mockReturnValue({ id: 1, rol: 'ESTUDIANTE' });

      const response = await request(app)
        .post('/api/bloque-horario/crear')
        .set('Authorization', 'Bearer token_simulado_estudiante')
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
      jwt.verify.mockReturnValue({ id: 1, rol: 'ADMINISTRADOR' });
      mockPrisma.bloqueHorario.findFirst.mockResolvedValue({
        id: '123',
        nroBloque: 1,
      });

      const response = await request(app)
        .post('/api/bloque-horario/crear')
        .set('Authorization', 'Bearer token_simulado_admin')
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
      jwt.verify.mockReturnValue({ id: 1, rol: 'ADMINISTRADOR' });
      mockPrisma.bloqueHorario.findFirst.mockResolvedValue(null);
      mockPrisma.bloqueHorario.create.mockResolvedValue({
        id: '123',
        nroBloque: 1,
        horaInicio: '08:00',
        horaFin: '09:00',
      });

      const response = await request(app)
        .post('/api/bloque-horario/crear')
        .set('Authorization', 'Bearer token_simulado_admin')
        .send({
          nroBloque: 1,
          horaInicio: '08:00',
          horaFin: '09:00',
        });

      expect(response.status).toBe(202);
      expect(response.body.mensaje).toBe(
        'Bloque horario creado exitosamente'
      );
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
      jwt.verify.mockReturnValue({ id: 1, rol: 'ESTUDIANTE' });

      const response = await request(app)
        .get('/api/bloque-horario/')
        .set('Authorization', 'Bearer token_simulado_estudiante');

      expect(response.status).toBe(401);
      expect(response.body.mensaje).toBe(
        'Usuario no tiene los permisos necesarios.'
      );
    });

    it('Si el usuario es ADMINISTRADOR debe retornar 200 y los bloques', async () => {
      jwt.verify.mockReturnValue({ id: 1, rol: 'ADMINISTRADOR' });
      mockPrisma.bloqueHorario.findMany.mockResolvedValue([
        {
          id: '1',
          nroBloque: 1,
          horaInicio: '08:00',
          horaFin: '09:00',
          bloqueReservados: [],
        },
        {
          id: '2',
          nroBloque: 2,
          horaInicio: '09:00',
          horaFin: '10:00',
          bloqueReservados: [],
        },
      ]);

      const response = await request(app)
        .get('/api/bloque-horario/')
        .set('Authorization', 'Bearer token_simulado_admin');

      expect(response.status).toBe(200);
      expect(response.body.mensaje).toBe(
        'Bloques horarios obtenidos con exito'
      );
      expect(response.body.bloques).toHaveLength(2);
    });

    it('Si el usuario es PROFESOR debe retornar 200 y los bloques', async () => {
      jwt.verify.mockReturnValue({ id: 1, rol: 'PROFESOR' });
      mockPrisma.bloqueHorario.findMany.mockResolvedValue([
        {
          id: '1',
          nroBloque: 1,
          horaInicio: '08:00',
          horaFin: '09:00',
          bloqueReservados: [],
        },
      ]);

      const response = await request(app)
        .get('/api/bloque-horario/')
        .set('Authorization', 'Bearer token_simulado_profesor');

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
      jwt.verify.mockReturnValue({ id: 1, rol: 'ESTUDIANTE' });

      const response = await request(app)
        .get('/api/bloque-horario/123')
        .set('Authorization', 'Bearer token_simulado_estudiante');

      expect(response.status).toBe(401);
      expect(response.body.mensaje).toBe(
        'Usuario no tiene los permisos necesarios.'
      );
    });

    it('Si el bloque no existe debe retornar error 401', async () => {
      jwt.verify.mockReturnValue({ id: 1, rol: 'PROFESOR' });
      mockPrisma.bloqueHorario.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/bloque-horario/123')
        .set('Authorization', 'Bearer token_simulado_profesor');

      expect(response.status).toBe(401);
      expect(response.body.mensaje).toBe(
        'El bloque horario no existe en la base de datos'
      );
    });

    it('Si todo es correcto debe retornar 200 y el bloque', async () => {
      jwt.verify.mockReturnValue({ id: 1, rol: 'PROFESOR' });
      mockPrisma.bloqueHorario.findUnique.mockResolvedValue({
        id: '123',
        nroBloque: 1,
        horaInicio: '08:00',
        horaFin: '09:00',
        bloqueReservados: [],
      });

      const response = await request(app)
        .get('/api/bloque-horario/123')
        .set('Authorization', 'Bearer token_simulado_profesor');

      expect(response.status).toBe(200);
      expect(response.body.mensaje).toBe(
        'Bloque horario obtenido con exito'
      );
      expect(response.body.bloque.nroBloque).toBe(1);
    });
  });

  describe('PUT /api/bloque-horario/actualizar/:bloqueId', () => {
    it('Si no se envía token debe retornar error 401', async () => {
      const response = await request(app)
        .put('/api/bloque-horario/actualizar/123')
        .send({
          nroBloque: 2,
          horaInicio: '09:00',
          horaFin: '10:00',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('mensaje');
    });

    it('Si el usuario no es ADMINISTRADOR debe retornar error 401', async () => {
      jwt.verify.mockReturnValue({ id: 1, rol: 'PROFESOR' });

      const response = await request(app)
        .put('/api/bloque-horario/actualizar/123')
        .set('Authorization', 'Bearer token_simulado_profesor')
        .send({
          nroBloque: 2,
          horaInicio: '09:00',
          horaFin: '10:00',
        });

      expect(response.status).toBe(401);
      expect(response.body.mensaje).toBe(
        'Usuario no tiene los permisos necesarios.'
      );
    });

    it('Si faltan datos debe retornar error 400', async () => {
      jwt.verify.mockReturnValue({ id: 1, rol: 'ADMINISTRADOR' });

      const response = await request(app)
        .put('/api/bloque-horario/actualizar/123')
        .set('Authorization', 'Bearer token_simulado_admin')
        .send({
          nroBloque: 2,
          // Falta horaInicio y horaFin
        });

      expect(response.status).toBe(400);
      expect(response.body.mensaje).toBe(
        'Todos los campos son obligatorios'
      );
    });

    it('Si el bloque no existe debe retornar error 401', async () => {
      jwt.verify.mockReturnValue({ id: 1, rol: 'ADMINISTRADOR' });
      mockPrisma.bloqueHorario.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/bloque-horario/actualizar/123')
        .set('Authorization', 'Bearer token_simulado_admin')
        .send({
          nroBloque: 2,
          horaInicio: '09:00',
          horaFin: '10:00',
        });

      expect(response.status).toBe(401);
      expect(response.body.mensaje).toBe(
        'El bloque horario no existe en la base de datos'
      );
    });

    it('Si todo es correcto debe retornar 200 y el bloque actualizado', async () => {
      jwt.verify.mockReturnValue({ id: 1, rol: 'ADMINISTRADOR' });
      mockPrisma.bloqueHorario.findUnique.mockResolvedValue({
        id: '123',
      });
      mockPrisma.bloqueHorario.update.mockResolvedValue({
        id: '123',
        nroBloque: 2,
        horaInicio: '09:00',
        horaFin: '10:00',
      });

      const response = await request(app)
        .put('/api/bloque-horario/actualizar/123')
        .set('Authorization', 'Bearer token_simulado_admin')
        .send({
          nroBloque: 2,
          horaInicio: '09:00',
          horaFin: '10:00',
        });

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
      jwt.verify.mockReturnValue({ id: 1, rol: 'PROFESOR' });

      const response = await request(app)
        .delete('/api/bloque-horario/eliminar/123')
        .set('Authorization', 'Bearer token_simulado_profesor');

      expect(response.status).toBe(401);
      expect(response.body.mensaje).toBe(
        'Usuario no tiene los permisos necesarios.'
      );
    });

    it('Si el bloque no existe debe retornar error 401', async () => {
      jwt.verify.mockReturnValue({ id: 1, rol: 'ADMINISTRADOR' });
      mockPrisma.bloqueHorario.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/bloque-horario/eliminar/123')
        .set('Authorization', 'Bearer token_simulado_admin');

      expect(response.status).toBe(401);
      expect(response.body.mensaje).toBe(
        'El bloque horario no existe en la base de datos'
      );
    });

    it('Si todo es correcto debe retornar 200 y eliminar el bloque', async () => {
      jwt.verify.mockReturnValue({ id: 1, rol: 'ADMINISTRADOR' });
      mockPrisma.bloqueHorario.findUnique.mockResolvedValue({
        id: '123',
      });
      mockPrisma.bloqueHorario.delete.mockResolvedValue({
        id: '123',
        nroBloque: 1,
        horaInicio: '08:00',
        horaFin: '09:00',
      });

      const response = await request(app)
        .delete('/api/bloque-horario/eliminar/123')
        .set('Authorization', 'Bearer token_simulado_admin');

      expect(response.status).toBe(200);
      expect(response.body.mensaje).toBe(
        'Bloque horario eliminado con exito'
      );
      expect(response.body.bloque.nroBloque).toBe(1);
    });
  });
});