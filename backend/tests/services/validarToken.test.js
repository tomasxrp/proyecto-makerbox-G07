const JWT = require('jsonwebtoken');
const { validarToken } = require('../../src/middlewares/validarToken');

jest.mock('jsonwebtoken');

describe('Middleware: validarToken', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('Debería retornar 400 si no hay token en headers', () => {
    validarToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'Token no proporcionado',
    });
  });

  it('Debería inyectar req.usuario y llamar a next() si el token es válido', () => {
    req.headers.authorization = 'Bearer token-valido';
    JWT.verify.mockReturnValue({ id: 1, rol: 'ADMINISTRADOR' });

    validarToken(req, res, next);

    expect(JWT.verify).toHaveBeenCalledWith(
      'token-valido',
      process.env.JWT_SECRET
    );
    expect(req.usuario).toEqual({ id: 1, rol: 'ADMINISTRADOR' });
    expect(next).toHaveBeenCalled();
  });
});
