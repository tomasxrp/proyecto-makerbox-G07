const articuloService = require('../services/ArticuloService');

const crearArticulo = async (req, res) => {
  try {
    const {
      nombreArticulo,
      stockActual,
      unidadMedida,
      alertaStock,
      notificarStock,
    } = req.body;

    const { usuario } = req;

    const nuevoArticulo = await articuloService.crearArticulo(
      usuario,
      nombreArticulo,
      stockActual,
      unidadMedida,
      alertaStock,
      notificarStock
    );

    res.status(200).json({
      nuevoArticulo,
    });
  } catch (error) {
    res.status(401).json({
      mensaje: error.message || 'Error al crear el artículo',
    });
  }
};

const eliminarArticulo = async (req, res) => {
  try {
    const { articuloId } = req.params;
    const { usuario } = req;

    const articuloEliminado = await articuloService.eliminarArticulo(
      usuario,
      articuloId
    );

    res.status(200).json({
      articuloEliminado,
    });
  } catch (error) {
    res.status(401).json({
      mensaje: error.message || 'Error al eliminar el artículo',
    });
  }
};

const obtenerArticulos = async (req, res) => {
  try {
    const articulos = await articuloService.obtenerArticulos();
    res.status(200).json({
      articulos,
    });
  } catch (error) {
    res.status(401).json({
      mensaje: error.message || 'Error al obtener los artículos',
    });
  }
};

const obtenerArticuloPorId = async (req, res) => {
  try {
    const { articuloId } = req.params;
    const articulo = await articuloService.obtenerArticuloPorId(articuloId);
    res.status(200).json({
      articulo,
    });
  } catch (error) {
    res.status(401).json({
      mensaje: error.message || 'Error al obtener el artículo',
    });
  }
};

const actualizarArticulo = async (req, res) => {
  try {
    const { articuloId } = req.params;
    const datosActualizar = req.body;
    const { usuario } = req;

    const articuloActualizado = await articuloService.actualizarArticulo(
      usuario,
      articuloId,
      datosActualizar
    );

    res.status(200).json({
      articuloActualizado,
    });
  } catch (error) {
    res.status(401).json({
      mensaje: error.message || 'Error al actualizar el artículo',
    });
  }
};

module.exports = {
  crearArticulo,
  eliminarArticulo,
  obtenerArticulos,
  obtenerArticuloPorId,
  actualizarArticulo,
};
