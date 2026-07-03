const { Router } = require('express');
const inscripcionAyudantiaController = require('../controllers/InscripcionAyudantiaController');
const { validarToken } = require('../middlewares/validarToken');
const {
  validarInscripcionAyudantia,
} = require('../middlewares/validarInscripcionAyudantia');

const router = Router();

router.post(
  '/crear',
  validarToken,
  validarInscripcionAyudantia,
  inscripcionAyudantiaController.crearInscripcionAyudantia
);

router.get(
  '/',
  validarToken,
  inscripcionAyudantiaController.obtenerInscripcionesAyudantias
);

router.get(
  '/ayudantia/:refAyudantia',
  validarToken,
  inscripcionAyudantiaController.obtenerInscripcionesPorAyudantia
);

router.get(
  '/:refAyudantia/:refEstudiante',
  validarToken,
  inscripcionAyudantiaController.obtenerInscripcionPorId
);

router.put(
  '/:refAyudantia/:refEstudiante',
  validarToken,
  validarInscripcionAyudantia,
  inscripcionAyudantiaController.actualizarInscripcionAyudantia
);

router.delete(
  '/:refAyudantia/:refEstudiante',
  validarToken,
  inscripcionAyudantiaController.eliminarInscripcionAyudantia
);

module.exports = router;
