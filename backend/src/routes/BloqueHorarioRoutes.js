const { Router } = require('express');
const bloqueHorarioController = require('../controllers/BloqueHorarioController');
const { validarBloqueHorario } = require('../middlewares/validarBloqueHorario');
const { validarToken } = require('../middlewares/validarToken');

const router = Router();

router.post(
  '/crear',
  validarToken,
  validarBloqueHorario,
  bloqueHorarioController.crearBloqueHorario
);
router.get('/', validarToken, bloqueHorarioController.obtenerTodosBloques);
router.get(
  '/:bloqueId',
  validarToken,
  bloqueHorarioController.obtenerBloquePorId
);
router.put(
  '/actualizar/:bloqueId',
  validarToken,
  validarBloqueHorario,
  bloqueHorarioController.actualizarBloqueHorario
);
router.delete(
  '/eliminar/:bloqueId',
  validarToken,
  bloqueHorarioController.eliminarBloqueHorario
);
module.exports = router;
