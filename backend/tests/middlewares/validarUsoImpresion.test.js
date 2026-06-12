const {
  validarUsoImpresion,
} = require('../../src/middlewares/validarUsoImpresion');

describe('Middleware: validarUsoImpresion', () => {
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

  it('Debería retornar 400 si falta refImpresion', () => {
    req.body = {
      refSemestre: 'sem-1',
      cantidadFilamento: 10,
      refArticulo: 'art-1',
    };

    validarUsoImpresion(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      mensaje:
        'Faltan datos obligatorios para el uso de impresión (refImpresion, refSemestre, refArticulo)',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('Debería retornar 400 si falta refSemestre', () => {
    req.body = {
      refImpresion: 'imp-1',
      cantidadFilamento: 10,
      refArticulo: 'art-1',
    };

    validarUsoImpresion(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      mensaje:
        'Faltan datos obligatorios para el uso de impresión (refImpresion, refSemestre, refArticulo)',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('Debería retornar 400 si falta refArticulo', () => {
    req.body = {
      refImpresion: 'imp-1',
      refSemestre: 'sem-1',
      cantidadFilamento: 10,
    };

    validarUsoImpresion(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      mensaje:
        'Faltan datos obligatorios para el uso de impresión (refImpresion, refSemestre, refArticulo)',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('Debería retornar 400 si falta cantidadFilamento', () => {
    req.body = {
      refImpresion: 'imp-1',
      refSemestre: 'sem-1',
      refArticulo: 'art-1',
    };

    validarUsoImpresion(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'La cantidad de filamento es obligatoria',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('Debería retornar 400 si cantidadFilamento no es un número entero', () => {
    req.body = {
      refImpresion: 'imp-1',
      refSemestre: 'sem-1',
      cantidadFilamento: 10.5,
      refArticulo: 'art-1',
    };

    validarUsoImpresion(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'La cantidad de filamento debe ser un número entero',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('Debería retornar 400 si cantidadFilamento es string', () => {
    req.body = {
      refImpresion: 'imp-1',
      refSemestre: 'sem-1',
      cantidadFilamento: 'diez',
      refArticulo: 'art-1',
    };

    validarUsoImpresion(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'La cantidad de filamento debe ser un número entero',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('Debería retornar 400 si cantidadFilamento es 0', () => {
    req.body = {
      refImpresion: 'imp-1',
      refSemestre: 'sem-1',
      cantidadFilamento: 0,
      refArticulo: 'art-1',
    };

    validarUsoImpresion(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'La cantidad de filamento debe ser mayor a 0',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('Debería retornar 400 si cantidadFilamento es negativo', () => {
    req.body = {
      refImpresion: 'imp-1',
      refSemestre: 'sem-1',
      cantidadFilamento: -5,
      refArticulo: 'art-1',
    };

    validarUsoImpresion(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'La cantidad de filamento debe ser mayor a 0',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('Debería llamar a next() si todos los datos son válidos', () => {
    req.body = {
      refImpresion: 'imp-1',
      refSemestre: 'sem-1',
      cantidadFilamento: 50,
      refArticulo: 'art-1',
    };

    validarUsoImpresion(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('Debería llamar a next() con datos opcionales incluidos', () => {
    req.body = {
      refImpresion: 'imp-1',
      refSolicitante: 'sol-1',
      refEstudiante: 'est-1',
      refSemestre: 'sem-1',
      cantidadFilamento: 100,
      refArticulo: 'art-1',
    };

    validarUsoImpresion(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
