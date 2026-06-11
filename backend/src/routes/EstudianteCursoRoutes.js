const { Router } = require('express');
const { validarToken } = require('../middlewares/validarToken');
const estudianteCursoController = require('../controllers/EstudianteCursoController');

const router = Router();

// definicion de rutas para estudiante curso
router.post(
  '/asignar',
  validarToken,
  estudianteCursoController.asignarEstudianteACurso
);
router.get(
  '/curso/:refCurso',
  validarToken,
  estudianteCursoController.obtenerEstudiantesPorCurso
);
router.get(
  '/estudiante/:refEstudiante',
  validarToken,
  estudianteCursoController.obtenerCursosPorEstudiante
);
router.delete(
  '/eliminar/:refCurso/:refEstudiante',
  validarToken,
  estudianteCursoController.eliminarAsignacion
);

module.exports = router;
