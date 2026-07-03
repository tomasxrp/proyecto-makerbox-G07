const impresionService = require('../services/ImpresionService');

const construirUrlArchivo = (req, file) => {
  if (!file) {
    return '';
  }

  return `${req.protocol}://${req.get('host')}/uploads/impresiones/${file.filename}`;
};

const crearImpresion = async (req, res) => {
  try {
    const { usuario } = req;
    const files = req.files || {};
    const archivoModelo3d = files.modelo3d ? files.modelo3d[0] : null;
    const archivoModeloStl = files.modeloStl ? files.modeloStl[0] : null;

    const payload = {
      ...req.body,
      urlModelo3d:
        req.body.urlModelo3d || construirUrlArchivo(req, archivoModelo3d),
      urlModeloStl:
        req.body.urlModeloStl || construirUrlArchivo(req, archivoModeloStl),
    };

    if (!payload.urlModelo3d || !payload.urlModeloStl) {
      throw new Error(
        'Debes adjuntar archivos o ingresar URLs para el modelo 3D y STL'
      );
    }

    const nuevaImpresion = await impresionService.crearImpresion(
      usuario,
      payload
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

const cambiarEstadoImpresion = async (req, res) => {
  try {
    const { usuario } = req;
    const { impresionId } = req.params;
    const { estado } = req.body;

    const impresionActualizada = await impresionService.cambiarEstadoImpresion(
      usuario,
      impresionId,
      estado
    );

    res.status(200).json({
      mensaje: 'Estado de impresión actualizado exitosamente',
      impresion: impresionActualizada,
    });
  } catch (error) {
    res.status(400).json({
      mensaje: error.message || 'Error al cambiar estado de impresión',
    });
  }
};

module.exports = {
  crearImpresion,
  cambiarEstadoImpresion,
  obtenerImpresiones,
};
