const { Router } = require('express');
const articuloController = require('../controllers/ArticuloController');

const router = Router();

router.post('/crear', articuloController.crearArticulo);
router.delete('/eliminar/:articuloId', articuloController.eliminarArticulo);

module.exports = router;
