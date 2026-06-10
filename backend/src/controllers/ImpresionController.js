const impresionService = require('../services/ImpresionService');

const crearImpresion = async (req, res) => {
  try {
    const { usuario } = req;
    const nuevaImpresion = await impresionService.crearImpresion(
      usuario,
      req.body
    );

    res.status(201).json({
      mensaje: 'Solicitud de impresión creada exitosamente',
      impresion: nuevaImpresion,
    });
  } catch (error) {
    res.status(400).json({
      mensaje: error.message || 'Error al crear la solicitud de impresión',
    });
  }
};

const obtenerImpresiones = async (req, res) => {
  try {
    const { usuario } = req;
    const impresiones = await impresionService.obtenerImpresiones(usuario);

    res.status(200).json({
      mensaje: 'Impresiones obtenidas exitosamente',
      impresiones,
    });
  } catch (error) {
    res.status(401).json({
      mensaje: error.message || 'Error al obtener impresiones',
    });
  }
};

module.exports = {
  crearImpresion,
  obtenerImpresiones,
};
