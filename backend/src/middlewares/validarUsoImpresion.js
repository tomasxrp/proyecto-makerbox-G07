const validarUsoImpresion = (req, res, next) => {
  const { refImpresion, refSemestre, cantidadFilamento, refArticulo } =
    req.body;

  if (!refImpresion || !refSemestre || !refArticulo) {
    return res.status(400).json({
      mensaje:
        'Faltan datos obligatorios para el uso de impresión (refImpresion, refSemestre, refArticulo)',
    });
  }

  if (cantidadFilamento === undefined || cantidadFilamento === null) {
    return res.status(400).json({
      mensaje: 'La cantidad de filamento es obligatoria',
    });
  }

  if (!Number.isInteger(cantidadFilamento)) {
    return res.status(400).json({
      mensaje: 'La cantidad de filamento debe ser un número entero',
    });
  }

  if (cantidadFilamento <= 0) {
    return res.status(400).json({
      mensaje: 'La cantidad de filamento debe ser mayor a 0',
    });
  }

  return next();
};

module.exports = {
  validarUsoImpresion,
};
