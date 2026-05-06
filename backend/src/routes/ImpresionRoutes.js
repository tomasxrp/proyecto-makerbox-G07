const { Router } = require('express');
const { validarToken } = require('../middlewares/validarToken');
const {
  validarImpresion,
  validarActualizacionImpresion,
} = require('../middlewares/validarImpresion');
const impresionController = require('../controllers/ImpresionController');

const router = Router();

router.post(
  '/',
  validarToken,
  validarImpresion,
  impresionController.crearImpresion
);
router.get('/', validarToken, impresionController.obtenerImpresiones);
router.get(
  '/:impresionId',
  validarToken,
  impresionController.obtenerImpresionPorId
);
router.patch(
  '/:impresionId/estado',
  validarToken,
  validarActualizacionImpresion,
  impresionController.actualizarEstadoImpresion
);

module.exports = router;
