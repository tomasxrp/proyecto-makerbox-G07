// eslint-disable-next-line
const mockPrisma = require('../prismaMock');

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/index');

jest.mock('jsonwebtoken');

describe('Prueba de integracion API GrupoCurso', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/grupo-curso/crear', () => {
    it('Si no se envia el token debe retornar error 401', async () => {
      const response = await request(app).post('/api/grupo-curso/crear').send({
        refCurso: 'curso-1',
        nombreGrupo: 'Grupo 1',
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('mensaje');
    });

    it('Cuando el usuario no tiene permisos (ej. ESTUDIANTE) debe retornar error 401', async () => {
      jwt.verify.mockReturnValue({ id: 2, rol: 'ESTUDIANTE' });

      const response = await request(app)
        .post('/api/grupo-curso/crear')
        .set('Authorization', 'Bearer token_estudiante')
        .send({
          refCurso: 'curso-1',
          nombreGrupo: 'Grupo 1',
        });

      expect(response.status).toBe(401);
      expect(response.body.mensaje).toBe(
        'Usuario no tiene los permisos necesarios.'
      );
    });

    it('Si faltan datos obligatorios debe retornar error 400', async () => {
      jwt.verify.mockReturnValue({ id: 1, rol: 'PROFESOR' });

      const response = await request(app)
        .post('/api/grupo-curso/crear')
        .set('Authorization', 'Bearer token_profe')
        .send({
          refCurso: 'curso-1',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('mensaje');
    });

    it('Si todo el flujo es correcto debe retornar 201 y crear el grupo', async () => {
      jwt.verify.mockReturnValue({ id: 1, rol: 'PROFESOR' });

      const grupoMock = {
        id: 'grupo-1',
        refCurso: 'curso-1',
        nombreGrupo: 'Grupo 1',
      };
      mockPrisma.grupoCurso.create.mockResolvedValue(grupoMock);

      const response = await request(app)
        .post('/api/grupo-curso/crear')
        .set('Authorization', 'Bearer token_profe')
        .send({ refCurso: 'curso-1', nombreGrupo: 'Grupo 1' });

      expect(response.status).toBe(201);
      expect(response.body.mensaje).toBe('Grupo creado exitosamente');
      expect(response.body.grupo).toEqual(grupoMock);
    });
  });

  describe('GET /api/grupo-curso/curso/:refCurso', () => {
    it('Si el usuario tiene acceso debe retornar 200 y la lista de grupos', async () => {
      jwt.verify.mockReturnValue({ id: 1, rol: 'PROFESOR' });

      mockPrisma.grupoCurso.findMany.mockResolvedValue([
        { id: 'grupo-1', refCurso: 'curso-1', nombreGrupo: 'Grupo 1' },
      ]);

      const response = await request(app)
        .get('/api/grupo-curso/curso/curso-1')
        .set('Authorization', 'Bearer token_valido');

      expect(response.status).toBe(200);
      expect(response.body.mensaje).toBe('Grupos obtenidos con éxito');
      expect(response.body.grupos).toHaveLength(1);
    });
  });

  describe('GET /api/grupo-curso/:id', () => {
    it('Si el grupo no existe debe retornar 401', async () => {
      jwt.verify.mockReturnValue({ id: 1, rol: 'PROFESOR' });
      mockPrisma.grupoCurso.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/grupo-curso/grupo-falso')
        .set('Authorization', 'Bearer token_valido');

      expect(response.status).toBe(401);
      expect(response.body.mensaje).toBe(
        'El grupo no existe en la base de datos'
      );
    });
  });

  describe('PUT /api/grupo-curso/:id', () => {
    it('Si el flujo es correcto debe actualizar el grupo', async () => {
      jwt.verify.mockReturnValue({ id: 1, rol: 'PROFESOR' });

      const grupoExistente = { id: 'grupo-1', nombreGrupo: 'Viejo' };
      mockPrisma.grupoCurso.findUnique.mockResolvedValue(grupoExistente);
      mockPrisma.grupoCurso.update.mockResolvedValue({
        id: 'grupo-1',
        nombreGrupo: 'Nuevo',
      });

      const response = await request(app)
        .put('/api/grupo-curso/grupo-1')
        .set('Authorization', 'Bearer token_valido')
        .send({ nombreGrupo: 'Nuevo' });

      expect(response.status).toBe(200);
      expect(response.body.mensaje).toBe('Grupo actualizado con exito');
      expect(response.body.grupoActualizado.nombreGrupo).toBe('Nuevo');
    });
  });

  describe('DELETE /api/grupo-curso/:id', () => {
    it('Si todo es correcto debe retornar 200 y eliminar el grupo', async () => {
      jwt.verify.mockReturnValue({ id: 1, rol: 'PROFESOR' });

      const grupoMock = { id: 'grupo-1', nombreGrupo: 'Grupo 1' };
      mockPrisma.grupoCurso.findUnique.mockResolvedValue(grupoMock);
      mockPrisma.grupoCurso.delete.mockResolvedValue(grupoMock);

      const response = await request(app)
        .delete('/api/grupo-curso/grupo-1')
        .set('Authorization', 'Bearer token_profe');

      expect(response.status).toBe(200);
      expect(response.body.mensaje).toBe('Grupo eliminado con exito');
      expect(response.body.grupoEliminado).toEqual(grupoMock);
    });
  });
});
