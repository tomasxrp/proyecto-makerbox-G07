const { Router } = require('express');
const { validarToken } = require('../middlewares/validarToken');
const { validarUsoImpresion } = require('../middlewares/validarUsoImpresion');
const usoImpresionController = require('../controllers/UsoImpresionController');

const router = Router();

router.post(
  '/crear',
  validarToken,
  validarUsoImpresion,
  usoImpresionController.crearUsoImpresion
);
router.get('/', validarToken, usoImpresionController.obtenerUsosImpresion);
router.get(
  '/impresion/:impresionId',
  validarToken,
  usoImpresionController.obtenerUsosImpresionPorImpresion
);
router.get(
  '/:usoImpresionId',
  validarToken,
  usoImpresionController.obtenerUsoImpresionPorId
);
router.put(
  '/actualizar/:usoImpresionId',
  validarToken,
  usoImpresionController.actualizarUsoImpresion
);
router.delete(
  '/eliminar/:usoImpresionId',
  validarToken,
  usoImpresionController.eliminarUsoImpresion
);

module.exports = router;
