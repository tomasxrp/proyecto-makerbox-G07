const validarBloqueHorario = (req, res, next) => {
    const { nroBloque, horaInicio, horaFin } = req.body;

    // Validar que todos los datos sean entregados 
    if (!nroBloque || !horaInicio || !horaFin) {
        return res
        .status(400)
        .json({ mensaje: 'Todos los campos son obligatorios'});

    }

    // Validar que nroBloque es int 
    if (!Number.isInteger(nroBloque)) {
        return res
        .status(400)
        .json({ mensaje: 'Numero de bloque debe ser numero entero.'})
    }

    // Validar formato de horas HH:MM
    const formatoHora = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!formatoHora.test(horaInicio) || !formatoHora.test(horaFin)) {
        return res
        .status(400)
        .json({ mensaje: 'Formato de hora debe ser HH:MM'});
    }

    return next();
};

module.exports = {
    validarBloqueHorario,
};