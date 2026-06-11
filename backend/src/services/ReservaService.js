const { PrismaClient } = require('@prisma/client');
const bloqueReservadoService = require('./BloqueReservadoService');

const prisma = new PrismaClient();

const crearReserva = async (datos) => {
  if (!datos.fechaReserva) {
    throw new Error('La fecha de reserva es requerida');
  }

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

  // Si se proporcionan bloques, crear los BloqueReservado
  if (
    datos.bloqueIds &&
    Array.isArray(datos.bloqueIds) &&
    datos.bloqueIds.length > 0
  ) {
    await Promise.all(
      datos.bloqueIds.map((bloqueId) =>
        bloqueReservadoService.crearBloqueReservado({
          bloqueId,
          reservaId: nuevaReserva.id,
        })
      )
    );
  }

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

const actualizarReserva = async (id, datos) => {
  const reserva = await prisma.reserva.update({
    where: { id },
    data: {
      estadoReserva: datos.estadoReserva || undefined,
      solicitanteNombre: datos.solicitanteNombre || undefined,
      solicitanteApellido: datos.solicitanteApellido || undefined,
      solicitanteCorreo: datos.solicitanteCorreo || undefined,
      motivoReserva: datos.motivoReserva || undefined,
      refAyudante: datos.refAyudante || undefined,
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

  return reserva;
};

const cancelarReserva = async (id) => {
  // Primero eliminar todos los BloqueReservado asociados
  await bloqueReservadoService.eliminarBloquesPorReserva(id);

  // Luego actualizar el estado de la reserva
  const reserva = await prisma.reserva.update({
    where: { id },
    data: {
      estadoReserva: 'CANCELADA',
    },
    include: {
      bloqueReservados: {
        include: {
          bloque: true,
        },
      },
    },
  });

  return reserva;
};

const confirmarReserva = async (id, usuario) => {
  if (usuario.rol !== 'AYUDANTE' && usuario.rol !== 'ADMINISTRADOR') {
    throw new Error(
      'Solo ayudantes o administradores pueden confirmar reservas'
    );
  }

  const reserva = await prisma.reserva.update({
    where: { id },
    data: {
      estadoReserva: 'CONFIRMADA',
      refAyudante: usuario.rol === 'AYUDANTE' ? usuario.id : undefined,
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

  return reserva;
};

const eliminarReserva = async (id) => {
  // Primero eliminar todos los BloqueReservado asociados
  await bloqueReservadoService.eliminarBloquesPorReserva(id);

  // Luego eliminar la reserva
  const reserva = await prisma.reserva.delete({
    where: { id },
  });

  return reserva;
};

module.exports = {
  crearReserva,
  obtenerReservas,
  obtenerReservaPorId,
  actualizarReserva,
  cancelarReserva,
  confirmarReserva,
  eliminarReserva,
};
