const { validarSemestre } = require('../../src/middlewares/validarSemestre');

describe('Middleware: validarSemestre', () => {
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

  it('Debería retornar 400 si los años no son números enteros', () => {
    req.body = {
      anio: '2026',
      periodo: '1',
      fechaInicio: '2026-03-01',
      fechaFin: '2026-07-15',
    }; // Strings en lugar de Int
    validarSemestre(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'El año y periodo deben ser numeros',
    });
  });

  it('Debería retornar 400 si el estado no es válido', () => {
    req.body = {
      anio: 2026,
      periodo: 1,
      fechaInicio: '2026-03-01',
      fechaFin: '2026-07-15',
      estado: 'PENDIENTE',
    };
    validarSemestre(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      mensaje:
        'El estado debe ser uno de los valores validos (ACTIVO, INACTIVO)',
    });
  });

  it('Debería llamar a next() si todo es correcto', () => {
    req.body = {
      anio: 2026,
      periodo: 1,
      fechaInicio: '2026-03-01',
      fechaFin: '2026-07-15',
      estado: 'ACTIVO',
    };
    validarSemestre(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
