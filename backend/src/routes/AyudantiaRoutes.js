const { Router } = require('express');
const { validarToken } = require('../middlewares/validarToken');
const { validarAyudantia } = require('../middlewares/validarAyudantia');
const ayudantiaController = require('../controllers/AyudantiaController');

const router = Router();

// definicion de rutas para ayudantia

router.post(
  '/crear',
  validarToken,
  validarAyudantia,
  ayudantiaController.crearAyudantia
);

router.get('/', validarToken, ayudantiaController.obtenerAyudantias);

router.get(
  '/:ayudantiaId',
  validarToken,
  ayudantiaController.obtenerAyudantiaPorId
);

router.delete(
  '/:ayudantiaId',
  validarToken,
  ayudantiaController.eliminarAyudantia
);

router.put(
  '/:ayudantiaId',
  validarToken,
  validarAyudantia,
  ayudantiaController.actualizarAyudantia
);

module.exports = router;
