const { Router } = require('express');
const { validarToken } = require('../middlewares/validarToken');
const { validarSemestre } = require('../middlewares/validarSemestre');
const semestreController = require('../controllers/SemestreController');

const router = Router();

// Definicion de rutas
router.post(
  '/crear',
  validarToken,
  validarSemestre,
  semestreController.crearSemestre
);
router.delete(
  '/eliminar/:semestreId',
  validarToken,
  semestreController.eliminarSemestre
);
router.get('/:semestreId', semestreController.obtenerSemestrePorId);
router.get('/', semestreController.obtenerSemestres);

module.exports = router;
