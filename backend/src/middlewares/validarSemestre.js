const validarSemestre = (req, res, next) => {
  const { anio, periodo, fechaInicio, fechaFin, estado } = req.body;

  // Se obliga a entregar los datos necesarios
  if (!anio || !periodo || !fechaInicio || !fechaFin) {
    return res
      .status(400)
      .json({ mensaje: 'Faltan datos obligatorios para el semestre' });
  }

  // Validacion de que el periodo o semestre sean numeros
  if (!Number.isInteger(anio) || !Number.isInteger(periodo)) {
    return res.status(400).json({
      mensaje: 'El año y periodo deben ser numeros',
    });
  }

  // verificar que la fecha es de tipo Date.
  // eslint-disable-next-line no-restricted-globals
  if (isNaN(Date.parse(fechaInicio)) || isNaN(Date.parse(fechaFin))) {
    return res.status(400).json({
      mensaje: 'Las fechas deben tener un formato valido (ej. YYYY-MM-DD)',
    });
  }

  if (estado !== undefined) {
    const estadosValidos = ['ACTIVO', 'INACTIVO'];

    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        mensaje:
          'El estado debe ser uno de los valores validos (ACTIVO, INACTIVO)',
      });
    }
  }

  if (new Date(fechaInicio) >= new Date(fechaFin)) {
    return res.status(400).json({
      mensaje: 'La fecha de inicio no puede ser mayor a la fecha fin',
    });
  }

  if (periodo !== 1 && periodo !== 2) {
    return res.status(400).json({
      mensaje: 'El periodo debe ser 1 o 2',
    });
  }

  return next();
};

module.exports = {
  validarSemestre,
};
