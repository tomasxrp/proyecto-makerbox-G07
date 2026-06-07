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

const obtenerCursos = async () => {
  // obtenemos todos los cursos registrados en la base de datos
  const cursos = await prisma.curso.findMany();
  return cursos;
};

const obtenerCursoPorId = async (cursoId) => {
  // bsucamos el curso expecifico por su id
  const cursoEncontrado = await prisma.curso.findUnique({
    where: {
      id: cursoId,
    },
  });

  if (!cursoEncontrado) {
    throw new Error('El curso no existe en la base de datos');
  }

  return cursoEncontrado;
};

module.exports = {
  crearCurso,
  obtenerCursos,
  obtenerCursoPorId,
};
