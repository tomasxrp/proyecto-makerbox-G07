const { Router } = require('express');
const { validarToken } = require('../middlewares/validarToken');
const grupoCursoController = require('../controllers/GrupoCursoController');

const router = Router();

// definicion de rutas para grupo curso
router.post('/crear', validarToken, grupoCursoController.crearGrupo);
router.get(
  '/curso/:refCurso',
  validarToken,
  grupoCursoController.obtenerGruposPorCurso
);
router.get('/:grupoId', validarToken, grupoCursoController.obtenerGrupoPorId);
router.put('/:grupoId', validarToken, grupoCursoController.actualizarGrupo);
router.delete('/:grupoId', validarToken, grupoCursoController.eliminarGrupo);

module.exports = router;
