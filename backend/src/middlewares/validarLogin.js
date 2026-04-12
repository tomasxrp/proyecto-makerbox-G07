const validarLogin = (req, res, next) => {
  const { correo, contrasena } = req.body;

  // Validacion de que el correo y la contrasena sean entregados
  if (!correo || !contrasena) {
    return res
      .status(400)
      .json({ mensaje: 'Correo y contraseña son obligatorios' });
  }

  return next();
};

module.exports = {
  validarLogin,
};
