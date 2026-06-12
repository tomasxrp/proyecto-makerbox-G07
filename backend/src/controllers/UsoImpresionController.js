const usoImpresionService = require('../services/UsoImpresionService');

const crearUsoImpresion = async (req, res) => {
  try {
    const { usuario } = req;
    const nuevoUsoImpresion = await usoImpresionService.crearUsoImpresion(
      usuario,
      req.body
    );

    res.status(201).json({
      mensaje: 'Uso de impresión creado exitosamente',
      usoImpresion: nuevoUsoImpresion,
    });
  } catch (error) {
    res.status(400).json({
      mensaje: error.message || 'Error al crear el uso de impresión',
    });
  }
};

const obtenerUsosImpresion = async (req, res) => {
  try {
    const usosImpresion = await usoImpresionService.obtenerUsosImpresion();

    res.status(200).json({
      mensaje: 'Usos de impresión obtenidos exitosamente',
      usosImpresion,
    });
  } catch (error) {
    res.status(401).json({
      mensaje: error.message || 'Error al obtener los usos de impresión',
    });
  }
};

const obtenerUsoImpresionPorId = async (req, res) => {
  try {
    const { usoImpresionId } = req.params;
    const usoImpresion =
      await usoImpresionService.obtenerUsoImpresionPorId(usoImpresionId);

    res.status(200).json({
      mensaje: 'Uso de impresión obtenido exitosamente',
      usoImpresion,
    });
  } catch (error) {
    res.status(404).json({
      mensaje: error.message || 'Error al obtener el uso de impresión',
    });
  }
};

const actualizarUsoImpresion = async (req, res) => {
  try {
    const { usoImpresionId } = req.params;
    const datosActualizar = req.body;
    const { usuario } = req;

    const usoImpresionActualizado =
      await usoImpresionService.actualizarUsoImpresion(
        usuario,
        usoImpresionId,
        datosActualizar
      );

    res.status(200).json({
      usoImpresionActualizado,
    });
  } catch (error) {
    res.status(401).json({
      mensaje: error.message || 'Error al actualizar el uso de impresión',
    });
  }
};

const eliminarUsoImpresion = async (req, res) => {
  try {
    const { usoImpresionId } = req.params;
    const { usuario } = req;

    const usoImpresionEliminado =
      await usoImpresionService.eliminarUsoImpresion(usuario, usoImpresionId);

    res.status(200).json({
      usoImpresionEliminado,
    });
  } catch (error) {
    res.status(401).json({
      mensaje: error.message || 'Error al eliminar el uso de impresión',
    });
  }
};

module.exports = {
  crearUsoImpresion,
  obtenerUsosImpresion,
  obtenerUsoImpresionPorId,
  actualizarUsoImpresion,
  eliminarUsoImpresion,
};
