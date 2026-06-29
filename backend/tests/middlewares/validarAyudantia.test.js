const { validarAyudantia } = require('../../src/middlewares/validarAyudantia');

describe('Middleware: validarAyudantia', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('Debería retornar 400 si faltan datos obligatorios', () => {
    req.body = {
      nombreAyudantia: 'Repaso',
      // Faltan refCurso, refAyudante, horario, cupoMaximo
    };
    validarAyudantia(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      mensaje:
        'Faltan datos obligatorios para la ayudantía (nombreAyudantia, refCurso, refAyudante, horario, cupoMaximo)',
    });
  });

  it('Debería retornar 400 si el cupoMaximo no es válido (ej. negativo)', () => {
    req.body = {
      nombreAyudantia: 'Repaso',
      refCurso: 'curso-id',
      refAyudante: 'ayu-id',
      horario: '2026-07-15T15:00:00Z',
      cupoMaximo: -5,
    };
    validarAyudantia(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'El cupo máximo debe ser un número entero mayor a 0',
    });
  });

  it('Debería retornar 400 si el horario no es una fecha válida', () => {
    req.body = {
      nombreAyudantia: 'Repaso',
      refCurso: 'curso-id',
      refAyudante: 'ayu-id',
      horario: 'fecha-invalida',
      cupoMaximo: 20,
    };
    validarAyudantia(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'El horario proporcionado no tiene un formato de fecha válido',
    });
  });

  it('Debería retornar 400 si el estado no es ACTIVA o INACTIVA', () => {
    req.body = {
      nombreAyudantia: 'Repaso',
      refCurso: 'curso-id',
      refAyudante: 'ayu-id',
      horario: '2026-07-15T15:00:00Z',
      cupoMaximo: 20,
      estado: 'PENDIENTE',
    };
    validarAyudantia(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'El estado debe ser ACTIVA o INACTIVA',
    });
  });

  it('Debería llamar a next() si los datos son correctos', () => {
    req.body = {
      nombreAyudantia: 'Repaso',
      refCurso: 'curso-id',
      refAyudante: 'ayu-id',
      horario: '2026-07-15T15:00:00Z',
      cupoMaximo: 20,
      estado: 'ACTIVA',
    };
    validarAyudantia(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
