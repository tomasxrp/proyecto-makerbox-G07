const {
  validarInscripcionAyudantia,
} = require('../../src/middlewares/validarInscripcionAyudantia');

describe('Middleware de Validación: validarInscripcionAyudantia', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('Debe fallar si faltan datos obligatorios', () => {
    req.body = { refAyudantia: '123' };

    validarInscripcionAyudantia(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      mensaje:
        'Faltan datos obligatorios para la inscripción (refAyudantia, refEstudiante)',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('Debe fallar si el estado de asistencia no es válido', () => {
    req.body = {
      refAyudantia: '123',
      refEstudiante: '456',
      estado: 'ESTADO_INVALIDO',
    };

    validarInscripcionAyudantia(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'El estado debe ser ASISTIO, FALTO o JUSTIFICO',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('Debe llamar a next() si los datos obligatorios y opcionales son correctos', () => {
    req.body = {
      refAyudantia: '123',
      refEstudiante: '456',
      estado: 'ASISTIO',
    };

    validarInscripcionAyudantia(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
