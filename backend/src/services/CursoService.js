const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const tienePermisoGestionCurso = (usuario) => {
  const rolUsuario = usuario.usuarioRol || usuario.rol;

  return (
    rolUsuario === 'ADMINISTRADOR' ||
    rolUsuario === 'AYUDANTE' ||
    rolUsuario === 'PROFESOR'
  );
};

const crearCurso = async (usuario, nombre, refSemestre, refProfesor) => {
  if (!tienePermisoGestionCurso(usuario)) {
    throw new Error('Usuario no tiene los permisos necesarios.');
  }

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
  const cursos = await prisma.curso.findMany({
    include: {
      semestre: true,
      profesor: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          correo: true,
        },
      },
      impresions: true,
    },
    orderBy: {
      creadoEn: 'desc',
    },
  });

  return cursos;
};

const obtenerCursoPorId = async (cursoId) => {
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

const eliminarCurso = async (usuario, cursoId) => {
  if (!tienePermisoGestionCurso(usuario)) {
    throw new Error('Usuario no tiene los permisos necesarios.');
  }

  const cursoEncontrado = await prisma.curso.findUnique({
    where: {
      id: cursoId,
    },
  });

  if (!cursoEncontrado) {
    throw new Error('El curso no existe en la base de datos');
  }

  const cursoEliminado = await prisma.curso.delete({
    where: {
      id: cursoId,
    },
  });

  return cursoEliminado;
};

const actualizarCurso = async (usuario, cursoId, data) => {
  if (!tienePermisoGestionCurso(usuario)) {
    throw new Error('Usuario no tiene los permisos necesarios.');
  }

  const cursoEncontrado = await prisma.curso.findUnique({
    where: {
      id: cursoId,
    },
  });

  if (!cursoEncontrado) {
    throw new Error('El curso no existe en la base de datos');
  }

  const cursoActualizado = await prisma.curso.update({
    where: {
      id: cursoId,
    },
    data,
  });

  return {
    mensaje: 'Curso actualizado con exito',
    cursoActualizado,
  };
};

module.exports = {
  crearCurso,
  obtenerCursos,
  obtenerCursoPorId,
  eliminarCurso,
  actualizarCurso,
};
