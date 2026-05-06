const { Router } = require('express');
const usuarioController = require('../controllers/UsuarioController');
const { validarRegistro } = require('../middlewares/validarRegistro');
const {
  validarCreacionUsuario,
} = require('../middlewares/validarCreacionUsuario');
const {
  validarActualizacionUsuario,
} = require('../middlewares/validarActualizacionUsuario');
const { validarLogin } = require('../middlewares/validarLogin');
const { validarToken } = require('../middlewares/validarToken');

const router = Router();

// Definicion de las rutas
router.post('/registro', validarRegistro, usuarioController.registrarUsuario);
router.post(
  '/crear',
  validarToken,
  validarCreacionUsuario,
  usuarioController.crearUsuario
);
router.patch(
  '/actualizar/:correo',
  validarToken,
  validarActualizacionUsuario,
  usuarioController.actualizarUsuario
);
router.post('/login', validarLogin, usuarioController.loginUsuario);
router.delete(
  '/eliminar/:correo',
  validarToken,
  usuarioController.eliminarUsuario
);
router.get('/:correo', validarToken, usuarioController.obtenerUsuarioPorCorreo);
router.get('/', validarToken, usuarioController.ObtenerListaUsuarios);

module.exports = router;
