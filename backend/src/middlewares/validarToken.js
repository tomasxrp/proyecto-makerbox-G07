const JWT = require('jsonwebtoken');

const validarToken = (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) {
      return res.status(400).json({
        mensaje: 'Token no proporcionado',
      });
    }

    const token = auth.split(' ')[1];
    const tokenDecodificado = JWT.verify(token, process.env.JWT_SECRET);

    req.usuario = tokenDecodificado;

    return next();
  } catch (error) {
    return res.status(401).json({
      mensaje: error.message || 'Error al validar el token',
    });
  }
};

module.exports = {
  validarToken,
};
