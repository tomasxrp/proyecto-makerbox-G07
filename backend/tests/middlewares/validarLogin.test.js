// tests/middlewares/validarLogin.test.js
const { validarLogin } = require('../../src/middlewares/validarLogin');

describe('Middleware: validarLogin', () => {
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

  it('Debería retornar 400 si falta el correo o la contraseña', () => {
    req.body = { correo: 'test@utalca.cl' }; // Falta la contraseña

    validarLogin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'Correo y contraseña son obligatorios',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('Debería llamar a next() si el body está completo', () => {
    req.body = { correo: 'test@utalca.cl', contrasena: 'Password123!' };

    validarLogin(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
