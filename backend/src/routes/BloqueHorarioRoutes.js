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

module.exports = router;