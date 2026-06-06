const { Router } = require('express');
const { validarToken } = require('../middlewares/validarToken');
const cursoController = require('../controllers/CursoController');

const router = Router();

// definicion de rutas para el curso
router.post('/crear', validarToken, cursoController.crearCurso);

module.exports = router;
