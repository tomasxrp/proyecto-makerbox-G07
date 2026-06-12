const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const crearGrupo = async (usuario, refCurso, nombreGrupo) => {
  // validamos que el usuario tenga los permisos requeridos
  if (
    usuario.rol !== 'ADMINISTRADOR' &&
    usuario.rol !== 'PROFESOR' &&
    usuario.rol !== 'AYUDANTE'
  ) {
    throw new Error('Usuario no tiene los permisos necesarios.');
  }

  // creamos el grupo en la base de datos
  const nuevoGrupo = await prisma.grupoCurso.create({
    data: {
      refCurso,
      nombreGrupo,
    },
  });

  return nuevoGrupo;
};

const obtenerGruposPorCurso = async (refCurso) => {
  // obtenemos todos los grupos de un curso especifico
  const grupos = await prisma.grupoCurso.findMany({
    where: {
      refCurso,
    },
  });
  return grupos;
};

const obtenerGrupoPorId = async (grupoId) => {
  // buscamos el grupo especifico por su id
  const grupoEncontrado = await prisma.grupoCurso.findUnique({
    where: {
      id: grupoId,
    },
  });

  if (!grupoEncontrado) {
    throw new Error('El grupo no existe en la base de datos');
  }

  return grupoEncontrado;
};

const actualizarGrupo = async (usuario, grupoId, data) => {
  // validamos que el usuario tenga los permisos requeridos
  if (
    usuario.rol !== 'ADMINISTRADOR' &&
    usuario.rol !== 'PROFESOR' &&
    usuario.rol !== 'AYUDANTE'
  ) {
    throw new Error('Usuario no tiene los permisos necesarios.');
  }

  // buscamos el grupo especifico por su id
  const grupoEncontrado = await prisma.grupoCurso.findUnique({
    where: {
      id: grupoId,
    },
  });

  if (!grupoEncontrado) {
    throw new Error('El grupo no existe en la base de datos');
  }

  // actualizamos el grupo en la base de datos
  const grupoActualizado = await prisma.grupoCurso.update({
    where: {
      id: grupoId,
    },
    data,
  });

  return {
    mensaje: 'Grupo actualizado con exito',
    grupoActualizado,
  };
};

const eliminarGrupo = async (usuario, grupoId) => {
  // validamos que el usuario tenga los permisos requeridos
  if (
    usuario.rol !== 'ADMINISTRADOR' &&
    usuario.rol !== 'PROFESOR' &&
    usuario.rol !== 'AYUDANTE'
  ) {
    throw new Error('Usuario no tiene los permisos necesarios.');
  }

  // buscamos el grupo especifico por su id
  const grupoEncontrado = await prisma.grupoCurso.findUnique({
    where: {
      id: grupoId,
    },
  });

  if (!grupoEncontrado) {
    throw new Error('El grupo no existe en la base de datos');
  }

  // eliminamos el grupo de la base de datos
  const grupoEliminado = await prisma.grupoCurso.delete({
    where: {
      id: grupoId,
    },
  });

  return grupoEliminado;
};

module.exports = {
  crearGrupo,
  obtenerGruposPorCurso,
  obtenerGrupoPorId,
  actualizarGrupo,
  eliminarGrupo,
};
