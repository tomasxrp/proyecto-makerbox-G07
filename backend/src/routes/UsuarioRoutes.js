const { Router } = require('express');
const usuarioController = require('../controllers/UsuarioController');
const { validarRegistro } = require('../middlewares/validarRegistro');
const { validarLogin } = require('../middlewares/validarLogin');
const { validarToken } = require('../middlewares/validarToken');

const router = Router();

// Definicion de las rutas
router.post('/registro', validarRegistro, usuarioController.registrarUsuario);
router.post('/login', validarLogin, usuarioController.loginUsuario);
router.delete(
  '/eliminar/:correo',
  validarToken,
  usuarioController.eliminarUsuario
);
router.get('/:correo', validarToken, usuarioController.obtenerUsuarioPorCorreo);

module.exports = router;
