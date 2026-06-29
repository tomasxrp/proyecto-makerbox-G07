const ayudantiaService = require('../services/AyudantiaService');

const crearAyudantia = async (req, res) => {
  try {
    const { usuario } = req;

    const nuevaAyudantia = await ayudantiaService.crearAyudantia(
      usuario,
      req.body
    );

    res.status(200).json({
      nuevaAyudantia,
    });
  } catch (error) {
    res.status(401).json({
      mensaje: error.message || 'Error al tratar de crear la ayudantía',
    });
  }
};

const obtenerAyudantias = async (req, res) => {
  try {
    const ayudantias = await ayudantiaService.obtenerAyudantias();
    res.status(200).json({
      ayudantias,
    });
  } catch (error) {
    res.status(401).json({
      mensaje: error.message || 'Error al tratar de obtener las ayudantías',
    });
  }
};

const obtenerAyudantiaPorId = async (req, res) => {
  try {
    const { ayudantiaId } = req.params;
    const ayudantia = await ayudantiaService.obtenerAyudantiaPorId(ayudantiaId);
    res.status(200).json({
      ayudantia,
    });
  } catch (error) {
    res.status(401).json({
      mensaje: error.message || 'Error al obtener la ayudantía',
    });
  }
};

const eliminarAyudantia = async (req, res) => {
  try {
    const { ayudantiaId } = req.params;
    const { usuario } = req;

    const ayudantiaEliminada = await ayudantiaService.eliminarAyudantia(
      usuario,
      ayudantiaId
    );

    res.status(200).json({
      ayudantiaEliminada,
    });
  } catch (error) {
    res.status(401).json({
      mensaje: error.message || 'Error al tratar de eliminar la ayudantía',
    });
  }
};

const actualizarAyudantia = async (req, res) => {
  try {
    const { ayudantiaId } = req.params;
    const { usuario } = req;
    const data = req.body;

    const resultado = await ayudantiaService.actualizarAyudantia(
      usuario,
      ayudantiaId,
      data
    );

    res.status(200).json(resultado);
  } catch (error) {
    res.status(401).json({
      mensaje: error.message || 'Error al tratar de actualizar la ayudantía',
    });
  }
};

module.exports = {
  crearAyudantia,
  obtenerAyudantias,
  obtenerAyudantiaPorId,
  eliminarAyudantia,
  actualizarAyudantia,
};
