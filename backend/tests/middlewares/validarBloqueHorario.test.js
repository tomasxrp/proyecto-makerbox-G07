const { validarBloqueHorario } = require('../../src/middlewares/validarBloqueHorario');

describe('Middleware: validarBloqueHorario', () => {
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

  it('Debería retornar 400 si faltan campos obligatorios', () => {
    req.body = { nroBloque: 1, horaInicio: '08:00' }; // Falta horaFin

    validarBloqueHorario(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'Todos los campos son obligatorios',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('Debería retornar 400 si nroBloque no es un número entero', () => {
    req.body = { nroBloque: 1.5, horaInicio: '08:00', horaFin: '09:00' };

    validarBloqueHorario(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'Numero de bloque debe ser numero entero.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('Debería retornar 400 si horaInicio no cumple formato HH:MM', () => {
    req.body = { nroBloque: 1, horaInicio: '8:0', horaFin: '09:00' };

    validarBloqueHorario(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'Formato de hora debe ser HH:MM',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('Debería retornar 400 si horaFin no cumple formato HH:MM', () => {
    req.body = { nroBloque: 1, horaInicio: '08:00', horaFin: '25:00' };

    validarBloqueHorario(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'Formato de hora debe ser HH:MM',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('Debería llamar a next() si todos los datos son válidos', () => {
    req.body = { nroBloque: 1, horaInicio: '08:00', horaFin: '09:00' };

    validarBloqueHorario(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});