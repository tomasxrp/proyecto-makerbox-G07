const { Router } = require('express');
const { validarToken } = require('../middlewares/validarToken');
const grupoEstudianteController = require('../controllers/GrupoEstudianteController');

const router = Router();

router.post(
  '/asignar',
  validarToken,
  grupoEstudianteController.asignarEstudianteAGrupo
);
router.get(
  '/grupo/:refGrupo',
  validarToken,
  grupoEstudianteController.obtenerEstudiantesPorGrupo
);
router.get(
  '/estudiante/:refEstudiante',
  validarToken,
  grupoEstudianteController.obtenerGruposPorEstudiante
);
router.delete(
  '/eliminar/:refGrupo/:refEstudiante',
  validarToken,
  grupoEstudianteController.eliminarAsignacion
);

module.exports = router;
