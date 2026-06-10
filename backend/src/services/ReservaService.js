const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const crearReserva = async (datos) => {
  const nuevaReserva = await prisma.reserva.create({
    data: {
      fechaReserva: new Date(datos.fechaReserva),
      estadoReserva: 'PENDIENTE',
      solicitanteNombre: datos.solicitanteNombre,
      solicitanteApellido: datos.solicitanteApellido,
      solicitanteCorreo: datos.solicitanteCorreo,
      solicitanteRut: datos.solicitanteRut,
      motivoReserva: datos.motivoReserva,
      refAyudante: datos.refAyudante || null,
    },
    include: {
      bloqueReservados: {
        include: {
          bloque: true,
        },
      },
      ayudante: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          correo: true,
        },
      },
    },
  });

  return nuevaReserva;
};

const obtenerReservas = async (usuario, filtros = {}) => {
  const where = {};

  if (usuario.rol === 'AYUDANTE') {
    where.refAyudante = usuario.id;
  }

  if (filtros.estado) {
    where.estadoReserva = filtros.estado;
  }

  if (filtros.fecha) {
    where.fechaReserva = {
      gte: new Date(filtros.fecha),
      lt: new Date(new Date(filtros.fecha).getTime() + 86400000),
    };
  }

  const reservas = await prisma.reserva.findMany({
    where,
    include: {
      bloqueReservados: {
        include: {
          bloque: true,
        },
      },
      ayudante: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          correo: true,
        },
      },
    },
    orderBy: { creadoEn: 'desc' },
  });

  return reservas;
};

const obtenerReservaPorId = async (id) => {
  const reserva = await prisma.reserva.findUnique({
    where: { id },
    include: {
      bloqueReservados: {
        include: {
          bloque: true,
        },
      },
      ayudante: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          correo: true,
        },
      },
    },
  });

  if (!reserva) {
    throw new Error('Reserva no encontrada');
  }

  return reserva;
};

module.exports = {
  crearReserva,
  obtenerReservas,
  obtenerReservaPorId,
};