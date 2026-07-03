const { Router } = require('express');
const { validarToken } = require('../middlewares/validarToken');
const ayudanteCursoController = require('../controllers/AyudanteCursoController');

const router = Router();

router.get(
  '/mis-cursos',
  validarToken,
  ayudanteCursoController.obtenerMisCursosAyudante
);
router.get(
  '/solicitudes',
  validarToken,
  ayudanteCursoController.obtenerSolicitudesAyudante
);
router.put(
  '/solicitudes/:id',
  validarToken,
  ayudanteCursoController.actualizarSolicitudAyudante
);

module.exports = router;
