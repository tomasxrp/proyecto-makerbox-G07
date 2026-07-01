const { Router } = require('express');
const usuarioController = require('../controllers/UsuarioController');
const { validarRegistro } = require('../middlewares/validarRegistro');
const { validarLogin } = require('../middlewares/validarLogin');
const { validarToken } = require('../middlewares/validarToken');

const router = Router();

router.post('/registro', validarRegistro, usuarioController.registrarUsuario);
router.post('/login', validarLogin, usuarioController.loginUsuario);

router.post(
  '/admin/crear',
  validarToken,
  usuarioController.crearUsuarioInterno
);

router.delete(
  '/eliminar/:correo',
  validarToken,
  usuarioController.eliminarUsuario
);

router.get('/:correo', validarToken, usuarioController.obtenerUsuarioPorCorreo);
router.get('/', validarToken, usuarioController.ObtenerListaUsuarios);

module.exports = router;
