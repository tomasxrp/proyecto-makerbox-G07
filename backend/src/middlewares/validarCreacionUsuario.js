const validarCreacionUsuario = (req, res, next) => {
  const { rut, nombre, apellido, correo, contrasena, rol } = req.body;
  const { usuario } = req;

  if (!rut || !nombre || !apellido || !correo || !contrasena || !rol) {
    return res.status(400).json({
      mensaje: 'Todos los campos son obligatorios',
    });
  }

  const regexCorreo = /^[^@]+@[^@]+\.[a-zA-Z]{2,}$/;
  if (regexCorreo.test(correo) === false) {
    return res.status(400).json({ mensaje: 'Correo no es valido' });
  }

  const regexContrasena =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  if (regexContrasena.test(contrasena) === false) {
    return res.status(400).json({
      mensaje:
        'Contraseña no es valida. Debe contener al menos 8 caracteres, una mayuscula y un numero',
    });
  }

  const rolesPermitidosPorCreador = {
    ADMINISTRADOR: [
      'ADMINISTRADOR',
      'PROFESOR',
      'AYUDANTE',
      'ESTUDIANTE',
      'SOLICITANTE',
    ],
    PROFESOR: ['AYUDANTE'],
  };

  const rolCreador = usuario && usuario.rol ? usuario.rol : undefined;
  const rolesPermitidos = rolesPermitidosPorCreador[rolCreador] || [];

  if (!rolesPermitidos.includes(rol)) {
    return res.status(403).json({
      mensaje: 'El usuario no tiene permisos para crear un usuario con ese rol',
    });
  }

  return next();
};

module.exports = {
  validarCreacionUsuario,
};
