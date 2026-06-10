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
};

const obtenerTodosBloques = async (req, res) => {
  try {
    const { usuario } = req;

    const bloques = await bloqueHorarioService.obtenerTodosBloques(usuario);

    res.status(200).json({
      mensaje: 'Bloques horarios obtenidos con exito',
      bloques,
    });
  } catch (error) {
    process.stderr.write(
      `Error al obtener bloques horarios: ${error.message || error}\n`
    );
    res.status(401).json({
      mensaje: error.message || 'Error al obtener bloques horarios',
    });
  }
};

const obtenerBloquePorId = async (req, res) => {
  try {
    const { bloqueId } = req.params;
    const { usuario } = req;

    const bloque = await bloqueHorarioService.obtenerBloquePorId(
      usuario,
      bloqueId
    );

    res.status(200).json({
      mensaje: 'Bloque horario obtenido con exito',
      bloque,
    });
  } catch (error) {
    process.stderr.write(
      `Error al obtener bloque horario: ${error.message || error}\n`
    );
    res.status(401).json({
      mensaje: error.message || 'Error al obtener bloque horario',
    });
  }
};

const actualizarBloqueHorario = async (req, res) => {
  try {
    const { bloqueId } = req.params;
    const { nroBloque, horaInicio, horaFin } = req.body;
    const { usuario } = req;

    const bloqueActualizado =
      await bloqueHorarioService.actualizarBloqueHorario(
        usuario,
        bloqueId,
        nroBloque,
        horaInicio,
        horaFin
      );

    res.status(200).json({
      mensaje: 'Bloque horario actualizado con exito',
      bloque: bloqueActualizado,
    });
  } catch (error) {
    process.stderr.write(
      `Error al actualizar bloque horario: ${error.message || error}\n`
    );
    res.status(401).json({
      mensaje: error.message || 'Error al actualizar bloque horario',
    });
  }
};

const eliminarBloqueHorario = async (req, res) => {
  try {
    const { bloqueId } = req.params;
    const { usuario } = req;

    const bloqueEliminado = await bloqueHorarioService.eliminarBloqueHorario(
      usuario,
      bloqueId
    );

    res.status(200).json({
      mensaje: 'Bloque horario eliminado con exito',
      bloque: bloqueEliminado,
    });
  } catch (error) {
    process.stderr.write(
      `Error al eliminar bloque horario: ${error.message || error}\n`
    );
    res.status(401).json({
      mensaje: error.message || 'Error al eliminar bloque horario',
    });
  }
};

module.exports = {
  crearBloqueHorario,
  obtenerTodosBloques,
  obtenerBloquePorId,
  actualizarBloqueHorario,
  eliminarBloqueHorario,
};
