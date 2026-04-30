const semestreService = require('../services/SemestreService');

const crearSemestre = async (req, res) => {
  try {
    const { anio, periodo, fechaInicio, fechaFin, estado } = req.body;
    const { usuario } = req;

    const nuevoSemestre = await semestreService.crearSemestre(
      usuario,
      anio,
      periodo,
      fechaInicio,
      fechaFin,
      estado
    );

    res.status(200).json({
      nuevoSemestre,
    });
  } catch (error) {
    res.status(401).json({
      mensaje: error.message || 'Error al crear el semestre',
    });
  }
};

const eliminarSemestre = async (req, res) => {
  try {
    const { semestreId } = req.params;
    const { usuario } = req;

    const semestreEliminado = await semestreService.eliminarSemestre(
      usuario,
      semestreId
    );

    res.status(200).json({
      semestreEliminado,
    });
  } catch (error) {
    res.status(401).json({
      mensaje: error.message || 'Error al eliminar el semestre',
    });
  }
};

module.exports = {
  crearSemestre,
  eliminarSemestre,
};
