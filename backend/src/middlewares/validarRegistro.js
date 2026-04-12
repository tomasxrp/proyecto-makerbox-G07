const validarRegistro = (req, res, next) => {
  const { rut, nombre, apellido, correo, contrasena, rol } = req.body;

  // Se valida que todos los campos sean entregados
  if (!rut || !nombre || !apellido || !correo || !contrasena || !rol) {
    return res
      .status(400)
      .json({ mensaje: 'Todos los campos son obligatorios' });
  }

  // Validacion del correo
  const regexCorreo = /^[^@]+@[^@]+\.[a-zA-Z]{2,}$/;
  if (regexCorreo.test(correo) === false) {
    return res.status(400).json({ mensaje: 'Correo no es valido' });
  }

  // Validacion de contrasena(minimo 8 caracteres, una mayuscula y un numero)
  const regexContrasena =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  if (regexContrasena.test(contrasena) === false) {
    return res.status(400).json({
      mensaje:
        'Contraseña no es valida. Debe contener al menos 8 caracteres, una mayuscula y un numero',
    });
  }

  // Se valida que el rol entregado sea uno de los roles validos
  const rolesValidos = [
    'ADMINISTRADOR',
    'PROFESOR',
    'AYUDANTE',
    'ESTUDIANTE',
    'SOLICITANTE',
  ];
  if (!rolesValidos.includes(rol)) {
    return res.status(400).json({ mensaje: 'Rol no es valido' });
  }

  return next();
};

module.exports = {
  validarRegistro,
};
