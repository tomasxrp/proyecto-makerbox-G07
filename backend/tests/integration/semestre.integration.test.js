const mockPrisma = require('../prismaMock');

// eslint-disable-next-line
const request = require('supertest');
const app = require('../../src/index');
// eslint-disable-next-line
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

describe('Pruebas de Integración: API Semestres', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/semestre/crear', () => {
    it('Si faltan datos debe retornar 400', async () => {
      // Simulamos ser un usuario ADMINSTRADOR valido para pasar validarToken
      jwt.verify.mockReturnValue({ id: 1, rol: 'ADMINISTRADOR' });

      const response = await request(app)
        .post('/api/semestre/crear')
        .set('Authorization', 'Bearer token_simulado')
        .send({ anio: 2026 }); // Faltan periodo, fechas

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('mensaje');
    });

    it('Si el usuario no es ADMINISTRADOR debe retornar 401', async () => {
      // Simulamos que el token es de un ESTUDIANTE
      jwt.verify.mockReturnValue({ id: 2, rol: 'ESTUDIANTE' });

      const response = await request(app)
        .post('/api/semestre/crear')
        .set('Authorization', 'Bearer token_simulado')
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
      jwt.verify.mockReturnValue({ id: 1, rol: 'ADMINISTRADOR' });

      mockPrisma.semestre.create.mockResolvedValue({
        id: 1,
        anio: 2026,
        periodo: 1,
        fechaInicio: new Date('2026-03-01'),
        fechaFin: new Date('2026-07-15'),
        estado: 'ACTIVO',
      });

      const response = await request(app)
        .post('/api/semestre/crear')
        .set('Authorization', 'Bearer token_simulado')
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
      jwt.verify.mockReturnValue({ id: 1, rol: 'ADMINISTRADOR' });
      mockPrisma.semestre.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/semestre/eliminar/999')
        .set('Authorization', 'Bearer token_simulado');

      expect(response.status).toBe(401);
      expect(response.body.mensaje).toBe(
        'El semestre no existe en la base de datos'
      );
    });

    it('Si el flujo completo es correcto debe retornar 200 al eliminar con éxito', async () => {
      jwt.verify.mockReturnValue({ id: 1, rol: 'ADMINISTRADOR' });

      mockPrisma.semestre.findUnique.mockResolvedValue({ id: 1, anio: 2026 });
      mockPrisma.semestre.delete.mockResolvedValue({ id: 1, anio: 2026 });

      const response = await request(app)
        .delete('/api/semestre/eliminar/1')
        .set('Authorization', 'Bearer token_simulado');

      expect(response.status).toBe(200);
      expect(response.body.semestreEliminado.mensaje).toBe(
        'Semestre eliminado con exito'
      );
    });
  });

  describe('GET /api/semestre/', () => {
    it('Si el flujo completo es correcto debe retornar 200 y la lista de semestres', async () => {
      mockPrisma.semestre.findMany.mockResolvedValue([
        { id: 1, anio: 2026, periodo: 1 },
        { id: 2, anio: 2026, periodo: 2 },
      ]);

      const response = await request(app).get('/api/semestre/');

      expect(response.status).toBe(200);
      expect(response.body.semestres).toHaveLength(2);
    });
  });
});
