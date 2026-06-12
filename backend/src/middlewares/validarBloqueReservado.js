const validarBloqueReservado = (req, res, next) => {
  try {
    const { bloqueId, reservaId } = req.body;

    // Validar campos requeridos
    if (!bloqueId || bloqueId.trim() === '') {
      return res.status(400).json({
        mensaje: 'El ID del bloque es requerido',
      });
    }

    if (!reservaId || reservaId.trim() === '') {
      return res.status(400).json({
        mensaje: 'El ID de la reserva es requerido',
      });
    }

    // Validar que sean strings validos
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(bloqueId)) {
      return res.status(400).json({
        mensaje: 'El ID del bloque no tiene un formato válido',
      });
    }

    if (!uuidRegex.test(reservaId)) {
      return res.status(400).json({
        mensaje: 'El ID de la reserva no tiene un formato válido',
      });
    }

    return next();
  } catch (error) {
    return res.status(400).json({
      mensaje: error.message || 'Error al validar el bloque reservado',
    });
  }
};

module.exports = {
  validarBloqueReservado,
};
