const { Router } = require('express');
const { validarToken } = require('../middlewares/validarToken');
const cursoController = require('../controllers/CursoController');

const router = Router();

// definicion de rutas para el curso
router.post('/crear', validarToken, cursoController.crearCurso);
router.get(
  '/disponibles',
  validarToken,
  cursoController.obtenerCursosDisponibles
);
router.get('/mis-cursos', validarToken, cursoController.obtenerMisCursos);
router.post(
  '/:cursoId/inscribir',
  validarToken,
  cursoController.inscribirEnCurso
);
router.get(
  '/:cursoId/ayudantes',
  validarToken,
  cursoController.obtenerAyudantesCurso
);
router.post(
  '/:cursoId/ayudantes',
  validarToken,
  cursoController.asignarAyudanteCurso
);
router.delete(
  '/:cursoId/ayudantes/:usuarioId',
  validarToken,
  cursoController.eliminarAyudanteCurso
);
router.get('/', validarToken, cursoController.obtenerCursos);
router.get('/:cursoId', validarToken, cursoController.obtenerCursoPorId);
router.delete('/:cursoId', validarToken, cursoController.eliminarCurso);
router.put('/:cursoId', validarToken, cursoController.actualizarCurso);

module.exports = router;
