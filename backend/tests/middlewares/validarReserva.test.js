const { validarReserva } = require('../../src/middlewares/validarReserva');

describe('Middleware: validarReserva', () => {
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

  it('Debería retornar 400 si falta fechaReserva', () => {
    req.body = {
      solicitanteNombre: 'Juan',
      solicitanteApellido: 'Pérez',
      solicitanteCorreo: 'juan@utalca.cl',
      solicitanteRut: '12345678-9',
      motivoReserva: 'Usar sala',
    };

    validarReserva(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'La fecha de reserva es requerida',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('Debería retornar 400 si falta solicitanteNombre', () => {
    req.body = {
      fechaReserva: '2026-07-15T10:00:00Z',
      solicitanteApellido: 'Pérez',
      solicitanteCorreo: 'juan@utalca.cl',
      solicitanteRut: '12345678-9',
      motivoReserva: 'Usar sala',
    };

    validarReserva(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'El nombre del solicitante es requerido',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('Debería retornar 400 si falta solicitanteApellido', () => {
    req.body = {
      fechaReserva: '2026-07-15T10:00:00Z',
      solicitanteNombre: 'Juan',
      solicitanteCorreo: 'juan@utalca.cl',
      solicitanteRut: '12345678-9',
      motivoReserva: 'Usar sala',
    };

    validarReserva(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'El apellido del solicitante es requerido',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('Debería retornar 400 si falta solicitanteCorreo', () => {
    req.body = {
      fechaReserva: '2026-07-15T10:00:00Z',
      solicitanteNombre: 'Juan',
      solicitanteApellido: 'Pérez',
      solicitanteRut: '12345678-9',
      motivoReserva: 'Usar sala',
    };

    validarReserva(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'El correo del solicitante es requerido',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('Debería retornar 400 si el correo no es válido', () => {
    req.body = {
      fechaReserva: '2026-07-15T10:00:00Z',
      solicitanteNombre: 'Juan',
      solicitanteApellido: 'Pérez',
      solicitanteCorreo: 'correo-invalido',
      solicitanteRut: '12345678-9',
      motivoReserva: 'Usar sala',
    };

    validarReserva(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'El correo proporcionado no es válido',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('Debería retornar 400 si falta solicitanteRut', () => {
    req.body = {
      fechaReserva: '2026-07-15T10:00:00Z',
      solicitanteNombre: 'Juan',
      solicitanteApellido: 'Pérez',
      solicitanteCorreo: 'juan@utalca.cl',
      motivoReserva: 'Usar sala',
    };

    validarReserva(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'El RUT del solicitante es requerido',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('Debería retornar 400 si falta motivoReserva', () => {
    req.body = {
      fechaReserva: '2026-07-15T10:00:00Z',
      solicitanteNombre: 'Juan',
      solicitanteApellido: 'Pérez',
      solicitanteCorreo: 'juan@utalca.cl',
      solicitanteRut: '12345678-9',
    };

    validarReserva(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'El motivo de la reserva es requerido',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('Debería retornar 400 si la fecha es en el pasado', () => {
    const fechaPasada = new Date(new Date().getTime() - 86400000).toISOString(); // Hace 1 día

    req.body = {
      fechaReserva: fechaPasada,
      solicitanteNombre: 'Juan',
      solicitanteApellido: 'Pérez',
      solicitanteCorreo: 'juan@utalca.cl',
      solicitanteRut: '12345678-9',
      motivoReserva: 'Usar sala',
    };

    validarReserva(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'La fecha de reserva debe ser en el futuro',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('Debería llamar a next() si todos los datos son válidos', () => {
    const fechaFutura = new Date(new Date().getTime() + 86400000).toISOString(); // En 1 día

    req.body = {
      fechaReserva: fechaFutura,
      solicitanteNombre: 'Juan',
      solicitanteApellido: 'Pérez',
      solicitanteCorreo: 'juan@utalca.cl',
      solicitanteRut: '12345678-9',
      motivoReserva: 'Usar sala interactiva para proyecto de laboratorio',
    };

    validarReserva(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
