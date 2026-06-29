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
