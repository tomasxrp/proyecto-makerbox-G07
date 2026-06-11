const { Router } = require('express');
const { validarToken } = require('../middlewares/validarToken');
const {
  validarBloqueReservado,
} = require('../middlewares/validarBloqueReservado');
const bloqueReservadoController = require('../controllers/BloqueReservadoController');

const router = Router();

router.post(
  '/crear',
  validarToken,
  validarBloqueReservado,
  bloqueReservadoController.crearBloqueReservado
);
router.get(
  '/',
  validarToken,
  bloqueReservadoController.obtenerBloqueReservados
);
router.get(
  '/reserva/:reservaId',
  validarToken,
  bloqueReservadoController.obtenerBloqueReservadosPorReserva
);
router.get(
  '/bloque/:bloqueId',
  validarToken,
  bloqueReservadoController.obtenerBloqueReservadosPorBloque
);
router.get(
  '/:bloqueId/:reservaId',
  validarToken,
  bloqueReservadoController.obtenerBloqueReservadoPorId
);
router.post(
  '/:bloqueId/verificar-disponibilidad',
  validarToken,
  bloqueReservadoController.verificarDisponibilidadBloque
);
router.delete(
  '/:bloqueId/:reservaId',
  validarToken,
  bloqueReservadoController.eliminarBloqueReservado
);

module.exports = router;
