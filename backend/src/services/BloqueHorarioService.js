const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const crearBloqueHorario = async (usuario, nroBloque, horaInicio, horaFin) => {
  // Validar permisos necesarios
  if (usuario.rol !== 'ADMINISTRADOR') {
    throw new Error('Usuario no tiene los permisos necesarios.');
  }

  // Verificar que no exista un bloque con el mismo numero
  const bloqueExistente = await prisma.bloqueHorario.findFirst({
    where: {
      nroBloque,
    },
  });

  if (bloqueExistente) {
    throw new Error('Ya existe un bloque horario con este número');
  }

  const nuevoBloque = await prisma.bloqueHorario.create({
    data: {
      nroBloque,
      horaInicio,
      horaFin,
    },
  });

  return nuevoBloque;
};

const obtenerTodosBloques = async (usuario) => {
  // Validar que el usuario tenga los permisos necesarios
  if (usuario.rol !== 'ADMINISTRADOR' && usuario.rol !== 'PROFESOR') {
    throw new Error('Usuario no tiene los permisos necesarios.');
  }

  const bloques = await prisma.bloqueHorario.findMany({
    include: {
      bloqueReservados: true,
    },
  });

  return bloques;
};

const obtenerBloquePorId = async (usuario, bloqueId) => {
  // Validar permisos necesarios
  if (usuario.rol !== 'ADMINISTRADOR' && usuario.rol !== 'PROFESOR') {
    throw new Error('Usuario no tiene los permisos necesarios.');
  }

  const bloque = await prisma.bloqueHorario.findUnique({
    where: {
      id: bloqueId,
    },
    include: {
      bloqueReservados: true,
    },
  });

  if (!bloque) {
    throw new Error('El bloque horario no existe en la base de datos');
  }

  return bloque;
};

const actualizarBloqueHorario = async (
  usuario,
  bloqueId,
  nroBloque,
  horaInicio,
  horaFin
) => {
  // Validar permisos necesarios
  if (usuario.rol !== 'ADMINISTRADOR') {
    throw new Error('Usuario no tiene los permisos necesarios.');
  }

  const bloqueEncontrado = await prisma.bloqueHorario.findUnique({
    where: {
      id: bloqueId,
    },
  });

  if (!bloqueEncontrado) {
    throw new Error('El bloque horario no existe en la base de datos');
  }

  const bloqueActualizado = await prisma.bloqueHorario.update({
    where: {
      id: bloqueId,
    },
    data: {
      nroBloque,
      horaInicio,
      horaFin,
    },
  });

  return bloqueActualizado;
};

const eliminarBloqueHorario = async (usuario, bloqueId) => {
  // Validar permisos necesarios
  if (usuario.rol !== 'ADMINISTRADOR') {
    throw new Error('Usuario no tiene los permisos necesarios.');
  }

  const bloqueEncontrado = await prisma.bloqueHorario.findUnique({
    where: {
      id: bloqueId,
    },
  });

  if (!bloqueEncontrado) {
    throw new Error('El bloque horario no existe en la base de datos');
  }

  const bloqueEliminado = await prisma.bloqueHorario.delete({
    where: {
      id: bloqueId,
    },
  });

  return bloqueEliminado;
};

module.exports = {
  crearBloqueHorario,
  obtenerTodosBloques,
  obtenerBloquePorId,
  actualizarBloqueHorario,
  eliminarBloqueHorario,
};
