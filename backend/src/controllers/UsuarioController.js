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

    res.status(201).json({
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

module.exports = {
  registrarUsuario,
};
