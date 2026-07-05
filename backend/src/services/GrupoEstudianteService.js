const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const tienePermiso = (usuario) => {
  const rolUsuario = usuario.rol || usuario.usuarioRol;

  return (
    rolUsuario === 'ADMINISTRADOR' ||
    rolUsuario === 'PROFESOR' ||
    rolUsuario === 'AYUDANTE'
  );
};

const asignarEstudianteAGrupo = async (usuario, refGrupo, refEstudiante) => {
  if (!tienePermiso(usuario)) {
    throw new Error('Usuario no tiene los permisos necesarios.');
  }

  const grupo = await prisma.grupoCurso.findUnique({
    where: {
      id: refGrupo,
    },
    select: {
      id: true,
      refCurso: true,
    },
  });

  if (!grupo) {
    throw new Error('El grupo no existe en la base de datos');
  }

  const estudiante = await prisma.usuario.findUnique({
    where: {
      id: refEstudiante,
    },
    select: {
      id: true,
      usuarioRol: true,
    },
  });

  if (!estudiante) {
    throw new Error(
      'El estudiante seleccionado aún no está registrado en la plataforma'
    );
  }

  if (estudiante.usuarioRol !== 'ESTUDIANTE') {
    throw new Error('El usuario seleccionado no tiene rol ESTUDIANTE');
  }

  const inscripcionCurso = await prisma.estudianteCurso.findUnique({
    where: {
      refCurso_refEstudiante: {
        refCurso: grupo.refCurso,
        refEstudiante,
      },
    },
  });

  if (!inscripcionCurso) {
    throw new Error('El estudiante no está inscrito en el curso de este grupo');
  }

  const asignacionExistente = await prisma.grupoEstudiante.findUnique({
    where: {
      refGrupo_refEstudiante: {
        refGrupo,
        refEstudiante,
      },
    },
  });

  if (asignacionExistente) {
    throw new Error('El estudiante ya está asignado a este grupo');
  }

  const nuevaAsignacion = await prisma.grupoEstudiante.create({
    data: {
      refGrupo,
      refEstudiante,
    },
  });

  return nuevaAsignacion;
};

const obtenerEstudiantesPorGrupo = async (refGrupo) => {
  const estudiantes = await prisma.grupoEstudiante.findMany({
    where: {
      refGrupo,
    },
    include: {
      estudiante: true,
    },
  });

  return estudiantes;
};

const obtenerGruposPorEstudiante = async (refEstudiante) => {
  const grupos = await prisma.grupoEstudiante.findMany({
    where: {
      refEstudiante,
    },
    include: {
      grupo: true,
    },
  });

  return grupos;
};

const eliminarAsignacion = async (usuario, refGrupo, refEstudiante) => {
  if (!tienePermiso(usuario)) {
    throw new Error('Usuario no tiene los permisos necesarios.');
  }

  const asignacionEncontrada = await prisma.grupoEstudiante.findUnique({
    where: {
      refGrupo_refEstudiante: {
        refGrupo,
        refEstudiante,
      },
    },
  });

  if (!asignacionEncontrada) {
    throw new Error('La asignación no existe en la base de datos');
  }

  const asignacionEliminada = await prisma.grupoEstudiante.delete({
    where: {
      refGrupo_refEstudiante: {
        refGrupo,
        refEstudiante,
      },
    },
  });

  return asignacionEliminada;
};

module.exports = {
  asignarEstudianteAGrupo,
  obtenerEstudiantesPorGrupo,
  obtenerGruposPorEstudiante,
  eliminarAsignacion,
};
