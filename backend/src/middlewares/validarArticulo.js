const validarArticulo = (req, res, next) => {
  const { nombreArticulo, unidadMedida, stockActual, alertaStock } = req.body;

  if (!nombreArticulo || !unidadMedida) {
    return res.status(400).json({
      mensaje: 'Faltan datos obligatorios para el artículo (nombreArticulo, unidadMedida)',
    });
  }

  if (stockActual !== undefined && !Number.isInteger(stockActual)) {
    return res.status(400).json({
      mensaje: 'El stock actual debe ser un número entero',
    });
  }

  if (alertaStock !== undefined && !Number.isInteger(alertaStock)) {
    return res.status(400).json({
      mensaje: 'La alerta de stock debe ser un número entero',
    });
  }

  return next();
};

module.exports = {
  validarArticulo,
};
