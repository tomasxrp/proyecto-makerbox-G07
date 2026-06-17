const { Router } = require('express');
const multer = require('multer');
const { validarToken } = require('../middlewares/validarToken');
const estudianteCursoController = require('../controllers/EstudianteCursoController');

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

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

router.post(
  '/cargar-csv',
  validarToken,
  upload.single('archivo'),
  estudianteCursoController.cargarEstudiantesDesdeCsv
);

module.exports = router;
