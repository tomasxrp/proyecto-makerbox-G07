const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const crearBloqueReservado = async (datos) => {
  const nuevoBloqueReservado = await prisma.bloqueReservado.create({
    data: {
      bloqueId: datos.bloqueId,
      reservaId: datos.reservaId,
    },
    include: {
      bloque: true,
      reserva: {
        include: {
          ayudante: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              correo: true,
            },
          },
        },
      },
    },
  });

  return nuevoBloqueReservado;
};

const obtenerBloqueReservados = async () => {
  const bloques = await prisma.bloqueReservado.findMany({
    include: {
      bloque: true,
      reserva: {
        include: {
          ayudante: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              correo: true,
            },
          },
        },
      },
    },
  });

  return bloques;
};

const obtenerBloqueReservadosPorReserva = async (reservaId) => {
  const bloques = await prisma.bloqueReservado.findMany({
    where: { reservaId },
    include: {
      bloque: true,
      reserva: {
        include: {
          ayudante: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              correo: true,
            },
          },
        },
      },
    },
  });

  return bloques;
};

const obtenerBloqueReservadosPorBloque = async (bloqueId) => {
  const bloques = await prisma.bloqueReservado.findMany({
    where: { bloqueId },
    include: {
      bloque: true,
      reserva: {
        include: {
          ayudante: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              correo: true,
            },
          },
        },
      },
    },
  });

  return bloques;
};

const obtenerBloqueReservadoPorId = async (bloqueId, reservaId) => {
  const bloqueReservado = await prisma.bloqueReservado.findUnique({
    where: {
      bloqueId_reservaId: {
        bloqueId,
        reservaId,
      },
    },
    include: {
      bloque: true,
      reserva: {
        include: {
          ayudante: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              correo: true,
            },
          },
        },
      },
    },
  });

  if (!bloqueReservado) {
    throw new Error('Bloque reservado no encontrado');
  }

  return bloqueReservado;
};

const verificarDisponibilidadBloque = async (bloqueId, fechaReserva) => {
  const bloqueReservado = await prisma.bloqueReservado.findFirst({
    where: {
      bloqueId,
      reserva: {
        fechaReserva: {
          gte: new Date(fechaReserva),
          lt: new Date(new Date(fechaReserva).getTime() + 86400000),
        },
        estadoReserva: 'CONFIRMADA',
      },
    },
  });

  return !bloqueReservado; // true si está disponible, false si ya está reservado
};

const eliminarBloqueReservado = async (bloqueId, reservaId) => {
  const bloqueReservado = await prisma.bloqueReservado.delete({
    where: {
      bloqueId_reservaId: {
        bloqueId,
        reservaId,
      },
    },
  });

  return bloqueReservado;
};

const eliminarBloquesPorReserva = async (reservaId) => {
  const bloques = await prisma.bloqueReservado.deleteMany({
    where: { reservaId },
  });

  return bloques;
};

module.exports = {
  crearBloqueReservado,
  obtenerBloqueReservados,
  obtenerBloqueReservadosPorReserva,
  obtenerBloqueReservadosPorBloque,
  obtenerBloqueReservadoPorId,
  verificarDisponibilidadBloque,
  eliminarBloqueReservado,
  eliminarBloquesPorReserva,
};
