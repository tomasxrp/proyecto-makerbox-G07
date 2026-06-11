// eslint-disable-next-line
const mockPrisma = require('../prismaMock');

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/index');

jest.mock('jsonwebtoken');

describe('Prueba de integracion API EstudianteCurso', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/estudiante-curso/asignar', () => {
    it('Si no se envia el token debe retornar error 401', async () => {
      const response = await request(app).post('/api/estudiante-curso/asignar').send({
        refCurso: 'curso-1',
        refEstudiante: 'estudiante-1'
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('mensaje');
    });

    it('Cuando el usuario no tiene permisos (ej. ESTUDIANTE) debe retornar error 401', async () => {
      jwt.verify.mockReturnValue({ id: 2, rol: 'ESTUDIANTE' });

      const response = await request(app)
        .post('/api/estudiante-curso/asignar')
        .set('Authorization', 'Bearer token_estudiante')
        .send({
          refCurso: 'curso-1',
          refEstudiante: 'estudiante-1'
        });

      expect(response.status).toBe(401);
      expect(response.body.mensaje).toBe('El usuario no tiene los permisos necesarios');
    });

    it('Si faltan datos obligatorios debe retornar error 400', async () => {
      jwt.verify.mockReturnValue({ id: 1, rol: 'PROFESOR' });

      const response = await request(app)
        .post('/api/estudiante-curso/asignar')
        .set('Authorization', 'Bearer token_profe')
        .send({
          refCurso: 'curso-1',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('mensaje');
    });

    it('Si todo el flujo es correcto debe retornar 201 y asignar el estudiante', async () => {
      jwt.verify.mockReturnValue({ id: 1, rol: 'PROFESOR' });
      
      const asignacionMock = { refCurso: 'curso-1', refEstudiante: 'estudiante-1' };
      mockPrisma.estudianteCurso.create.mockResolvedValue(asignacionMock);

      const response = await request(app)
        .post('/api/estudiante-curso/asignar')
        .set('Authorization', 'Bearer token_profe')
        .send(asignacionMock);

      expect(response.status).toBe(201);
      expect(response.body.mensaje).toBe('Estudiante asignado al curso exitosamente');
      expect(response.body.asignacion).toEqual(asignacionMock);
    });
  });

  describe('GET /api/estudiante-curso/curso/:refCurso', () => {
    it('Si el usuario tiene acceso debe retornar 200 y la lista de estudiantes', async () => {
      jwt.verify.mockReturnValue({ id: 1, rol: 'PROFESOR' });

      mockPrisma.estudianteCurso.findMany.mockResolvedValue([
        { refCurso: 'curso-1', refEstudiante: 'estudiante-1' },
        { refCurso: 'curso-1', refEstudiante: 'estudiante-2' },
      ]);

      const response = await request(app)
        .get('/api/estudiante-curso/curso/curso-1')
        .set('Authorization', 'Bearer token_valido');

      expect(response.status).toBe(200);
      expect(response.body.mensaje).toBe('Estudiantes del curso obtenidos con éxito');
      expect(response.body.estudiantes).toHaveLength(2);
    });
  });

  describe('DELETE /api/estudiante-curso/eliminar/:refCurso/:refEstudiante', () => {
    it('Si el usuario no tiene permisos debe retornar 401', async () => {
      jwt.verify.mockReturnValue({ id: 2, rol: 'ESTUDIANTE' });

      const response = await request(app)
        .delete('/api/estudiante-curso/eliminar/curso-1/estudiante-1')
        .set('Authorization', 'Bearer token_estudiante');

      expect(response.status).toBe(401);
    });

    it('Si todo es correcto debe retornar 200 y eliminar la asignación', async () => {
      jwt.verify.mockReturnValue({ id: 1, rol: 'PROFESOR' });

      const asignacionMock = { refCurso: 'curso-1', refEstudiante: 'estudiante-1' };
      mockPrisma.estudianteCurso.findUnique.mockResolvedValue(asignacionMock);
      mockPrisma.estudianteCurso.delete.mockResolvedValue(asignacionMock);

      const response = await request(app)
        .delete('/api/estudiante-curso/eliminar/curso-1/estudiante-1')
        .set('Authorization', 'Bearer token_profe');

      expect(response.status).toBe(200);
      expect(response.body.mensaje).toBe('Asignación eliminada con éxito');
      expect(response.body.asignacion).toEqual(asignacionMock);
    });
  });
});
