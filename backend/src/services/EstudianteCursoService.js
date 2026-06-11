const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const asignarEstudianteACurso = async (usuario, refCurso, refEstudiante) => {
  // validamos que el usuario tenga los permisos requeridos
  if (
    usuario.rol !== 'ADMINISTRADOR' &&
    usuario.rol !== 'PROFESOR' &&
    usuario.rol !== 'AYUDANTE'
  ) {
    throw new Error('Usuario no tiene los permisos necesarios.');
  }

  // se crea la asignacion en la base de datos
  const nuevaAsignacion = await prisma.estudianteCurso.create({
    data: {
      refCurso,
      refEstudiante,
    },
  });

  return nuevaAsignacion;
};

const obtenerEstudiantesPorCurso = async (refCurso) => {
  // obtenemos todos los estudiantes asignados a un curso especifico
  const estudiantes = await prisma.estudianteCurso.findMany({
    where: {
      refCurso,
    },
    include: {
      estudiante: true,
    },
  });
  return estudiantes;
};

const obtenerCursosPorEstudiante = async (refEstudiante) => {
  // obtenemos todos los cursos a los que pertenece un estudiante
  const cursos = await prisma.estudianteCurso.findMany({
    where: {
      refEstudiante,
    },
    include: {
      curso: true,
    },
  });
  return cursos;
};

const eliminarAsignacion = async (usuario, refCurso, refEstudiante) => {
  // validamos que el usuario tenga los permisos requeridos
  if (
    usuario.rol !== 'ADMINISTRADOR' &&
    usuario.rol !== 'PROFESOR' &&
    usuario.rol !== 'AYUDANTE'
  ) {
    throw new Error('Usuario no tiene los permisos necesarios.');
  }

  // buscamos si la asignacion especifica existe
  const asignacionEncontrada = await prisma.estudianteCurso.findUnique({
    where: {
      refCurso_refEstudiante: {
        refCurso,
        refEstudiante,
      },
    },
  });

  if (!asignacionEncontrada) {
    throw new Error('La asignación no existe en la base de datos');
  }

  // eliminamos la asignacion de la base de datos
  const asignacionEliminada = await prisma.estudianteCurso.delete({
    where: {
      refCurso_refEstudiante: {
        refCurso,
        refEstudiante,
      },
    },
  });

  return asignacionEliminada;
};

module.exports = {
  asignarEstudianteACurso,
  obtenerEstudiantesPorCurso,
  obtenerCursosPorEstudiante,
  eliminarAsignacion,
};
