const { Router } = require('express');
const usuarioController = require('../controllers/UsuarioController');
const { validarRegistro } = require('../middlewares/validarRegistro');
const { validarLogin } = require('../middlewares/validarLogin');

const router = Router();

// Definicion de las rutas
router.post('/registro', validarRegistro, usuarioController.registrarUsuario);
router.post('/login', validarLogin, usuarioController.loginUsuario);
module.exports = router;
