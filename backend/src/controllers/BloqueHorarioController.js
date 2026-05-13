const bloqueHorarioService = require('../services/BloqueHorarioService');

const crearBloqueHorario = async (req, res) => {
  try {
    const { nroBloque, horaInicio, horaFin } = req.body;
    const { usuario } = req;
    
    const nuevoBloque = await bloqueHorarioService.crearBloqueHorario(
      usuario,
      nroBloque,
      horaInicio,
      horaFin
    );

    res.status(202).json({
      mensaje: 'Bloque horario creado exitosamente',
      bloque: nuevoBloque,
    });
  } catch (error) {
    process.stderr.write(
      `Error al crear bloque horario: ${error.message || error}\n`
    );
    res.status(400).json({
      mensaje: error.message || 'Error al crear bloque horario',
    });
  }
}

module.exports = {
  crearBloqueHorario,
};