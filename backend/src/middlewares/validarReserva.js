const validarReserva = (req, res, next) => {
  try {
    const {
      fechaReserva,
      solicitanteNombre,
      solicitanteApellido,
      solicitanteCorreo,
      solicitanteRut,
      motivoReserva,
      bloqueIds,
    } = req.body;

    // Validación de campos requeridos
    if (!fechaReserva) {
      return res.status(400).json({
        mensaje: 'La fecha de reserva es requerida',
      });
    }

    if (!solicitanteNombre || solicitanteNombre.trim() === '') {
      return res.status(400).json({
        mensaje: 'El nombre del solicitante es requerido',
      });
    }

    if (!solicitanteApellido || solicitanteApellido.trim() === '') {
      return res.status(400).json({
        mensaje: 'El apellido del solicitante es requerido',
      });
    }

    if (!solicitanteCorreo || solicitanteCorreo.trim() === '') {
      return res.status(400).json({
        mensaje: 'El correo del solicitante es requerido',
      });
    }

    // Validar formato de correo
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexCorreo.test(solicitanteCorreo)) {
      return res.status(400).json({
        mensaje: 'El correo proporcionado no es válido',
      });
    }

    if (!solicitanteRut || solicitanteRut.trim() === '') {
      return res.status(400).json({
        mensaje: 'El RUT del solicitante es requerido',
      });
    }

    if (!motivoReserva || motivoReserva.trim() === '') {
      return res.status(400).json({
        mensaje: 'El motivo de la reserva es requerido',
      });
    }

    // Validar que la fecha sea en el futuro
    const fechaParsed = new Date(fechaReserva);
    const ahora = new Date();

    if (fechaParsed <= ahora) {
      return res.status(400).json({
        mensaje: 'La fecha de reserva debe ser en el futuro',
      });
    }

    // Validar bloqueIds si se proporciona
    if (bloqueIds !== undefined) {
      if (!Array.isArray(bloqueIds)) {
        return res.status(400).json({
          mensaje: 'bloqueIds debe ser un array de IDs',
        });
      }

      if (bloqueIds.length === 0) {
        return res.status(400).json({
          mensaje: 'Debe proporcionar al menos un bloque horario',
        });
      }

      // Validar que cada bloqueId sea un UUID válido
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const idInvalido = bloqueIds.find(
        (bloqueId) => !uuidRegex.test(bloqueId)
      );
      if (idInvalido) {
        return res.status(400).json({
          mensaje: `El ID de bloque ${idInvalido} no tiene un formato válido`,
        });
      }
    }

    return next();
  } catch (error) {
    return res.status(400).json({
      mensaje: error.message || 'Error al validar la reserva',
    });
  }
};

module.exports = {
  validarReserva,
};
