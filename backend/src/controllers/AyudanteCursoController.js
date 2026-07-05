const ayudanteCursoService = require('../services/AyudanteCursoService');

const obtenerMisCursosAyudante = async (req, res) => {
  try {
    const { usuario } = req;
    const cursos = await ayudanteCursoService.obtenerMisCursos(usuario);

    res.status(200).json({
      cursos,
    });
  } catch (error) {
    res.status(401).json({
      mensaje: error.message || 'Error al obtener cursos de ayudante',
    });
  }
};

const obtenerSolicitudesAyudante = async (req, res) => {
  try {
    const { usuario } = req;
    const solicitudes = await ayudanteCursoService.obtenerSolicitudes(usuario);

    res.status(200).json({
      solicitudes,
    });
  } catch (error) {
    res.status(401).json({
      mensaje: error.message || 'Error al obtener solicitudes del ayudante',
    });
  }
};

const actualizarSolicitudAyudante = async (req, res) => {
  try {
    const { usuario } = req;
    const { id } = req.params;

    const solicitudActualizada = await ayudanteCursoService.actualizarSolicitud(
      usuario,
      id,
      req.body
    );

    res.status(200).json({
      mensaje: 'Solicitud actualizada correctamente',
      solicitud: solicitudActualizada,
    });
  } catch (error) {
    res.status(400).json({
      mensaje: error.message || 'Error al actualizar solicitud del ayudante',
    });
  }
};

module.exports = {
  obtenerMisCursosAyudante,
  obtenerSolicitudesAyudante,
  actualizarSolicitudAyudante,
};
