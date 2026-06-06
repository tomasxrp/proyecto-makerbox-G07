const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const crearCurso = async (usuario, nombre, refSemestre, refProfesor) => {
  // validamos qeu el usuario tenga los permisos requeridos
  if (
    usuario.rol !== 'ADMINISTRADOR' &&
    usuario.rol !== 'AYUDANTE' &&
    usuario.rol !== 'PROFESOR'
  ) {
    throw new Error('Usuario no tiene los permisos necesarios.');
  }

  // se crea el curso en la base de datos
  const nuevoCurso = await prisma.curso.create({
    data: {
      nombre,
      refSemestre,
      refProfesor,
    },
  });

  return nuevoCurso;
};

module.exports = {
  crearCurso,
};
