const inscripcionAyudantiaService = require('../services/InscripcionAyudantiaService');

const crearInscripcionAyudantia = async (req, res) => {
  try {
    const { usuario } = req;
    const nuevaInscripcion =
      await inscripcionAyudantiaService.crearInscripcionAyudantia(
        usuario,
        req.body
      );

    res.status(200).json({
      nuevaInscripcion,
    });
  } catch (error) {
    res.status(401).json({
      mensaje: error.message || 'Error al tratar de crear la inscripción',
    });
  }
};

const obtenerInscripcionesAyudantias = async (req, res) => {
  try {
    const inscripciones =
      await inscripcionAyudantiaService.obtenerInscripcionesAyudantias();
    res.status(200).json({
      inscripciones,
    });
  } catch (error) {
    res.status(401).json({
      mensaje: error.message || 'Error al tratar de obtener las inscripciones',
    });
  }
};

const obtenerInscripcionPorId = async (req, res) => {
  try {
    const { refAyudantia, refEstudiante } = req.params;
    const inscripcion =
      await inscripcionAyudantiaService.obtenerInscripcionPorId(
        refAyudantia,
        refEstudiante
      );
    res.status(200).json({
      inscripcion,
    });
  } catch (error) {
    res.status(401).json({
      mensaje: error.message || 'Error al obtener la inscripción',
    });
  }
};

const obtenerInscripcionesPorAyudantia = async (req, res) => {
  try {
    const { refAyudantia } = req.params;
    const inscripciones =
      await inscripcionAyudantiaService.obtenerInscripcionesPorAyudantia(
        refAyudantia
      );
    res.status(200).json({
      inscripciones,
    });
  } catch (error) {
    res.status(401).json({
      mensaje:
        error.message || 'Error al obtener las inscripciones de la ayudantía',
    });
  }
};

const actualizarInscripcionAyudantia = async (req, res) => {
  try {
    const { refAyudantia, refEstudiante } = req.params;
    const { usuario } = req;
    const data = req.body;

    const resultado =
      await inscripcionAyudantiaService.actualizarInscripcionAyudantia(
        usuario,
        refAyudantia,
        refEstudiante,
        data
      );

    res.status(200).json(resultado);
  } catch (error) {
    res.status(401).json({
      mensaje: error.message || 'Error al tratar de actualizar la inscripción',
    });
  }
};

const eliminarInscripcionAyudantia = async (req, res) => {
  try {
    const { refAyudantia, refEstudiante } = req.params;
    const { usuario } = req;

    const inscripcionEliminada =
      await inscripcionAyudantiaService.eliminarInscripcionAyudantia(
        usuario,
        refAyudantia,
        refEstudiante
      );

    res.status(200).json({
      inscripcionEliminada,
    });
  } catch (error) {
    res.status(401).json({
      mensaje: error.message || 'Error al tratar de eliminar la inscripción',
    });
  }
};

module.exports = {
  crearInscripcionAyudantia,
  obtenerInscripcionesAyudantias,
  obtenerInscripcionPorId,
  obtenerInscripcionesPorAyudantia,
  actualizarInscripcionAyudantia,
  eliminarInscripcionAyudantia,
};
