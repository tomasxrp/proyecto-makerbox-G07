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

module.exports = {
  crearArticulo,
  eliminarArticulo,
};
