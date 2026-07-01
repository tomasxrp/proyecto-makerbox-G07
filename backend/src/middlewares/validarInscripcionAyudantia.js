const validarInscripcionAyudantia = (req, res, next) => {
  const { refAyudantia, refEstudiante, estado } = req.body;

  if (!refAyudantia || !refEstudiante) {
    return res.status(400).json({
      mensaje:
        'Faltan datos obligatorios para la inscripción (refAyudantia, refEstudiante)',
    });
  }

  if (estado && !['ASISTIO', 'FALTO', 'JUSTIFICO'].includes(estado)) {
    return res.status(400).json({
      mensaje: 'El estado debe ser ASISTIO, FALTO o JUSTIFICO',
    });
  }

  return next();
};

module.exports = {
  validarInscripcionAyudantia,
};
