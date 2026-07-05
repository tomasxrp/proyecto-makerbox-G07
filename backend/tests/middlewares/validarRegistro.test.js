const { validarRegistro } = require('../../src/middlewares/validarRegistro');

describe('Middleware: validarRegistro', () => {
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

  it('Debería retornar 400 si faltan campos', () => {
    req.body = { nombre: 'Juan' }; // Faltan rut, correo, etc.
    validarRegistro(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'Todos los campos son obligatorios',
    });
  });

  it('Debería retornar 400 si el correo es inválido', () => {
    req.body = {
      rut: '1',
      nombre: 'J',
      apellido: 'P',
      correo: 'correo-malo',
      contrasena: 'Pass123!',
      rol: 'ESTUDIANTE',
    };
    validarRegistro(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'Correo no es valido' });
  });

  it('Debería retornar 400 si la contraseña no cumple requisitos (sin mayúscula)', () => {
    req.body = {
      rut: '1',
      nombre: 'J',
      apellido: 'P',
      correo: 'test@utalca.cl',
      contrasena: 'pass1234',
      rol: 'ESTUDIANTE',
    };
    validarRegistro(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: expect.stringContaining('Contraseña no es valida'),
    });
  });

  it('Debería llamar a next() si todo es correcto', () => {
    req.body = {
      rut: '1',
      nombre: 'J',
      apellido: 'P',
      correo: 'test@alumnos.utalca.cl',
      contrasena: 'Pass1234',
      rol: 'ESTUDIANTE',
    };
    validarRegistro(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('Debería retornar 400 si estudiante no usa dominio alumnos.utalca.cl', () => {
    req.body = {
      rut: '1',
      nombre: 'J',
      apellido: 'P',
      correo: 'test@utalca.cl',
      contrasena: 'Pass1234',
      rol: 'ESTUDIANTE',
    };

    validarRegistro(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      mensaje:
        'El correo para estudiantes debe usar el dominio @alumnos.utalca.cl',
    });
  });
});
