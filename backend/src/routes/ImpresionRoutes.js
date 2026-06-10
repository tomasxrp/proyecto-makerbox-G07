const { Router } = require('express');
const { validarToken } = require('../middlewares/validarToken');
const impresionController = require('../controllers/ImpresionController');

const router = Router();

router.post('/crear', validarToken, impresionController.crearImpresion);
router.get('/', validarToken, impresionController.obtenerImpresiones);

module.exports = router;
