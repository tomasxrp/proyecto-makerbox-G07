const impresionService = require('../services/ImpresionService');

const crearImpresion = async (req, res) => {
  try {
    const { usuario } = req;
    const resultado = await impresionService.crearImpresion(usuario, req.body);

    res.status(201).json(resultado);
  } catch (error) {
    res.status(400).json({
      mensaje: error.message || 'Error al crear la impresion',
    });
  }
};

const obtenerImpresiones = async (req, res) => {
  try {
    const { usuario } = req;
    const impresiones = await impresionService.obtenerImpresiones(usuario);

    res.status(200).json({
      mensaje: 'Impresiones obtenidas con exito',
      impresiones,
    });
  } catch (error) {
    res.status(400).json({
      mensaje: error.message || 'Error al obtener impresiones',
    });
  }
};

const obtenerImpresionPorId = async (req, res) => {
  try {
    const { usuario } = req;
    const { impresionId } = req.params;
    const impresion = await impresionService.obtenerImpresionPorId(
      usuario,
      impresionId
    );

    res.status(200).json({
      mensaje: 'Impresion obtenida con exito',
      impresion,
    });
  } catch (error) {
    res.status(400).json({
      mensaje: error.message || 'Error al obtener la impresion',
    });
  }
};

const actualizarEstadoImpresion = async (req, res) => {
  try {
    const { usuario } = req;
    const { impresionId } = req.params;
    const resultado = await impresionService.actualizarEstadoImpresion(
      usuario,
      impresionId,
      req.body
    );

    res.status(200).json(resultado);
  } catch (error) {
    res.status(400).json({
      mensaje: error.message || 'Error al actualizar la impresion',
    });
  }
};

module.exports = {
  crearImpresion,
  obtenerImpresiones,
  obtenerImpresionPorId,
  actualizarEstadoImpresion,
};
