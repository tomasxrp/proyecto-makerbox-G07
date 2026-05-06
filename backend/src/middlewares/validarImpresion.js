const validarImpresion = (req, res, next) => {
  const {
    colorOpcion1,
    colorOpcion2,
    colorOpcion3,
    urlModelo3d,
    urlModeloStl,
    comentario,
  } = req.body;

  if (
    !colorOpcion1 ||
    !colorOpcion2 ||
    !colorOpcion3 ||
    !urlModelo3d ||
    !urlModeloStl ||
    !comentario
  ) {
    return res.status(400).json({
      mensaje:
        'Los colores, las URLs del modelo y el comentario son obligatorios',
    });
  }

  return next();
};

const validarActualizacionImpresion = (req, res, next) => {
  const { estado } = req.body;

  const estadosValidos = ['PENDIENTE', 'EN_PROCESO', 'COMPLETADA', 'CANCELADA'];

  if (!estado || !estadosValidos.includes(estado)) {
    return res.status(400).json({
      mensaje:
        'El estado debe ser uno de los valores validos (PENDIENTE, EN_PROCESO, COMPLETADA, CANCELADA)',
    });
  }

  return next();
};

module.exports = {
  validarImpresion,
  validarActualizacionImpresion,
};
