const validarActualizacionUsuario = (req, res, next) => {
  const { usuario } = req;

  if (!usuario || usuario.rol !== 'ADMINISTRADOR') {
    return res.status(403).json({
      mensaje: 'El usuario no tiene permisos para actualizar usuarios',
    });
  }

  return next();
};

module.exports = {
  validarActualizacionUsuario,
};
