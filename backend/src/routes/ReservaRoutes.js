const { Router } = require('express');
const { validarToken } = require('../middlewares/validarToken');
const { validarReserva } = require('../middlewares/validarReserva');
const reservaController = require('../controllers/ReservaController');

const router = Router();

router.post(
  '/crear', 
  validarReserva, 
  reservaController.crearReserva
);

router.get(
  '/', validarToken, 
  reservaController.obtenerReservas
);

router.get(
  '/:id', 
  validarToken, 
  reservaController.obtenerReservaPorId
);

module.exports = router;