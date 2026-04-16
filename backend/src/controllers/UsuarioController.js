const usuarioService = require('../services/UsuarioService');

const registrarUsuario = async (req, res) => {
  try {
    const { rut, nombre, apellido, correo, contrasena, rol } = req.body;

    const nuevoUsuario = await usuarioService.registrarUsuario(
      rut,
      nombre,
      apellido,
      correo,
      contrasena,
      rol
    );

    res.status(202).json({
      mensaje: 'Usuario registrado exitosamente',
      usuario: nuevoUsuario,
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(400).json({
      mensaje: error.message || 'Error al registrar usuario',
    });
  }
};

const loginUsuario = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    const resultadoLogin = await usuarioService.loginUsuario(
      correo,
      contrasena
    );

    res.status(200).json({
      mensaje: 'Login exitoso',
      resultadoLogin,
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(401).json({
      mensaje: error.message || 'Error al iniciar sesión',
    });
  }
};

const eliminarUsuario = async (req, res) => {
  try {
    const { correo } = req.params;
    const { usuario } = req;

    const usuarioEliminado = await usuarioService.eliminarUsuario(
      usuario,
      correo
    );

    res.status(200).json({
      mensaje: 'Usuario borrado con exito',
      usuario: usuarioEliminado,
    });
  } catch (error) {
    res.status(401).json({
      mensaje: error.message || 'Error al borrar usuario',
    });
  }
};

const obtenerUsuarioPorCorreo = async (req, res) => {
  try {
    const { correo } = req.params;
    const { usuario } = req;

    const usuarioObtenido = await usuarioService.obtenerUsuarioPorCorreo(
      correo,
      usuario
    );

    res.status(200).json({
      mensaje: 'Usuario obtenido con exito',
      usuario: usuarioObtenido,
    });
  } catch (error) {
    res.status(401).json({
      mensaje: error.message || 'Error al obtener usuario',
    });
  }
};

module.exports = {
  registrarUsuario,
  loginUsuario,
  eliminarUsuario,
  obtenerUsuarioPorCorreo,
};
