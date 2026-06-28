const validarAyudantia = (req, res, next) => {
  const {
    nombreAyudantia,
    refCurso,
    refAyudante,
    horario,
    cupoMaximo,
    estado,
  } = req.body;

  // 1. Validar que vengan los datos obligatorios
  if (
    !nombreAyudantia ||
    !refCurso ||
    !refAyudante ||
    !horario ||
    cupoMaximo === undefined
  ) {
    return res.status(400).json({
      mensaje:
        'Faltan datos obligatorios para la ayudantía (nombreAyudantia, refCurso, refAyudante, horario, cupoMaximo)',
    });
  }

  // 2. Validar que el cupo sea un número entero y mayor a 0
  if (!Number.isInteger(cupoMaximo) || cupoMaximo <= 0) {
    return res.status(400).json({
      mensaje: 'El cupo máximo debe ser un número entero mayor a 0',
    });
  }

  // 3. Validar que el horario sea una fecha reconocible
  if (Number.isNaN(Date.parse(horario))) {
    return res.status(400).json({
      mensaje: 'El horario proporcionado no tiene un formato de fecha válido',
    });
  }

  // 4. Validar que si envían estado, sea uno de los permitidos por el Enum de Prisma
  if (estado && !['ACTIVA', 'INACTIVA'].includes(estado)) {
    return res.status(400).json({
      mensaje: 'El estado debe ser ACTIVA o INACTIVA',
    });
  }

  return next();
};

module.exports = {
  validarAyudantia,
};
