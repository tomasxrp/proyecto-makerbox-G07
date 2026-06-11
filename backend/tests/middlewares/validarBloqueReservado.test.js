const {
  validarBloqueReservado,
} = require('../../src/middlewares/validarBloqueReservado');

describe('Middleware: validarBloqueReservado', () => {
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

  it('Debería retornar 400 si falta bloqueId', () => {
    req.body = {
      reservaId: '660e8400-e29b-41d4-a716-446655440111',
    };

    validarBloqueReservado(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'El ID del bloque es requerido',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('Debería retornar 400 si falta reservaId', () => {
    req.body = {
      bloqueId: '550e8400-e29b-41d4-a716-446655440000',
    };

    validarBloqueReservado(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'El ID de la reserva es requerido',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('Debería retornar 400 si bloqueId no es UUID válido', () => {
    req.body = {
      bloqueId: 'id-invalido',
      reservaId: '660e8400-e29b-41d4-a716-446655440111',
    };

    validarBloqueReservado(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'El ID del bloque no tiene un formato válido',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('Debería retornar 400 si reservaId no es UUID válido', () => {
    req.body = {
      bloqueId: '550e8400-e29b-41d4-a716-446655440000',
      reservaId: 'id-invalido',
    };

    validarBloqueReservado(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'El ID de la reserva no tiene un formato válido',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('Debería llamar a next() si ambos IDs son válidos', () => {
    req.body = {
      bloqueId: '550e8400-e29b-41d4-a716-446655440000',
      reservaId: '660e8400-e29b-41d4-a716-446655440111',
    };

    validarBloqueReservado(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
