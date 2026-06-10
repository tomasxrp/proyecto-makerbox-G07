const validarReserva = (req, res, next) => {
  try {
    const {
      fechaReserva,
      solicitanteNombre,
      solicitanteApellido,
      solicitanteCorreo,
      solicitanteRut,
      motivoReserva,
    } = req.body;

    // Validación de informacion obligatoria
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