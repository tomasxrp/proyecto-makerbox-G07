import Router from 'express';
import articuloController from '../controllers/ArticuloController.js';

const router = Router();

router.post('/crear', articuloController.crearArticulo);
router.delete('/eliminar/:articuloId', articuloController.eliminarArticulo);

export default router;
