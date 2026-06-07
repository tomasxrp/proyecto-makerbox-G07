const { Router } = require('express');
const { validarToken } = require('../middlewares/validarToken');
const cursoController = require('../controllers/CursoController');

const router = Router();

// definicion de rutas para el curso
router.post('/crear', validarToken, cursoController.crearCurso);
router.get('/', validarToken, cursoController.obtenerCursos);
router.get('/:cursoId', validarToken, cursoController.obtenerCursoPorId);
router.delete('/:cursoId', validarToken, cursoController.eliminarCurso);
router.put('/:cursoId', validarToken, cursoController.actualizarCurso);

module.exports = router;
