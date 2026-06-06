const { Router } = require('express');
const { validarToken } = require('../middlewares/validarToken');
const { validarArticulo } = require('../middlewares/validarArticulo');
const articuloController = require('../controllers/ArticuloController');

const router = Router();

router.post('/crear', validarToken, validarArticulo, articuloController.crearArticulo);
router.delete('/eliminar/:articuloId', validarToken, articuloController.eliminarArticulo);
router.get('/', articuloController.obtenerArticulos);
router.get('/:articuloId', articuloController.obtenerArticuloPorId);
router.put('/actualizar/:articuloId', validarToken, articuloController.actualizarArticulo);

module.exports = router;
