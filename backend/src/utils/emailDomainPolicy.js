const normalizarCorreo = (correo = '') => correo.trim().toLowerCase();

const validarDominioCorreoPorRol = (correo, rol) => {
  const correoNormalizado = normalizarCorreo(correo);

  if (!correoNormalizado.includes('@')) {
    return {
      esValido: false,
      mensaje: 'Correo no es valido',
    };
  }

  if (
    rol === 'ESTUDIANTE' &&
    !correoNormalizado.endsWith('@alumnos.utalca.cl')
  ) {
    return {
      esValido: false,
      mensaje:
        'El correo para estudiantes debe usar el dominio @alumnos.utalca.cl',
    };
  }

  if (rol === 'PROFESOR' && !correoNormalizado.endsWith('@utalca.cl')) {
    return {
      esValido: false,
      mensaje: 'El correo para profesores debe usar el dominio @utalca.cl',
    };
  }

  return {
    esValido: true,
    mensaje: '',
  };
};

module.exports = {
  normalizarCorreo,
  validarDominioCorreoPorRol,
};
