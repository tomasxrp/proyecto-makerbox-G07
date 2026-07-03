const { PrismaClient } = require('@prisma/client');
const { enviarCorreoCambioEstadoSolicitud } = require('./EmailService');

const prisma = new PrismaClient();

const ESTADOS_PERMITIDOS = [
  'PENDIENTE',
  'EN_PROCESO',
  'COMPLETADA',
  'CANCELADA',
];

const validarAccesoAyudante = async (usuario, cursoId) => {
  const rolUsuario = usuario.usuarioRol || usuario.rol;

  if (rolUsuario === 'ADMINISTRADOR') {
    return true;
  }

  if (rolUsuario === 'AYUDANTE') {
    return true;
  }

  const asignacion = await prisma.cursoAyudante.findUnique({
    where: {
      refCurso_refUsuario: {
        refCurso: cursoId,
        refUsuario: usuario.id,
      },
    },
  });

  return Boolean(asignacion);
};

const obtenerMisCursos = async (usuario) => {
  const rolUsuario = usuario.usuarioRol || usuario.rol;

  if (rolUsuario === 'ADMINISTRADOR') {
    return prisma.curso.findMany({
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
      },
      orderBy: {
        creadoEn: 'desc',
      },
    });
  }

  if (rolUsuario === 'AYUDANTE') {
    return prisma.curso.findMany({
      where: {
        ayudantias: {
          some: {
            refAyudante: usuario.id,
          },
        },
      },
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
      },
      orderBy: {
        creadoEn: 'desc',
      },
    });
  }

  const cursosAsignados = await prisma.cursoAyudante.findMany({
    where: {
      refUsuario: usuario.id,
    },
    include: {
      curso: {
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
        },
      },
    },
    orderBy: {
      creadoEn: 'desc',
    },
  });

  return cursosAsignados.map((registro) => registro.curso);
};

const obtenerSolicitudes = async (usuario) => {
  const rolUsuario = usuario.usuarioRol || usuario.rol;

  const includeSolicitud = {
    curso: true,
    estudiante: {
      select: {
        id: true,
        nombre: true,
        apellido: true,
        correo: true,
      },
    },
  };

  if (rolUsuario === 'ADMINISTRADOR') {
    return prisma.impresion.findMany({
      include: includeSolicitud,
      orderBy: {
        creadoEn: 'desc',
      },
    });
  }

  if (rolUsuario === 'AYUDANTE') {
    const [cantidadAyudantias, cantidadAsignacionesCurso] = await Promise.all([
      prisma.ayudantia.count({
        where: {
          refAyudante: usuario.id,
        },
      }),
      prisma.cursoAyudante.count({
        where: {
          refUsuario: usuario.id,
        },
      }),
    ]);

    // Si el ayudante no tiene cursos asociados, se considera ayudante global.
    if (cantidadAyudantias === 0 && cantidadAsignacionesCurso === 0) {
      return prisma.impresion.findMany({
        include: includeSolicitud,
        orderBy: {
          creadoEn: 'desc',
        },
      });
    }

    return prisma.impresion.findMany({
      where: {
        OR: [
          {
            curso: {
              ayudantias: {
                some: {
                  refAyudante: usuario.id,
                },
              },
            },
          },
          {
            curso: {
              cursoAyudantes: {
                some: {
                  refUsuario: usuario.id,
                },
              },
            },
          },
          {
            refAyudante: usuario.id,
          },
        ],
      },
      include: includeSolicitud,
      orderBy: {
        creadoEn: 'desc',
      },
    });
  }

  return prisma.impresion.findMany({
    where: {
      curso: {
        cursoAyudantes: {
          some: {
            refUsuario: usuario.id,
          },
        },
      },
    },
    include: includeSolicitud,
    orderBy: {
      creadoEn: 'desc',
    },
  });
};

const actualizarSolicitud = async (usuario, impresionId, data) => {
  const solicitud = await prisma.impresion.findUnique({
    where: {
      id: impresionId,
    },
    include: {
      estudiante: {
        select: {
          nombre: true,
          correo: true,
        },
      },
    },
  });

  if (!solicitud) {
    throw new Error('Solicitud de impresión no encontrada');
  }

  if (!solicitud.refCurso) {
    throw new Error('La solicitud no está asociada a un curso');
  }

  const puedeGestionar = await validarAccesoAyudante(
    usuario,
    solicitud.refCurso
  );

  if (!puedeGestionar) {
    throw new Error('No tienes permisos para gestionar esta solicitud');
  }

  if (solicitud.estado === 'COMPLETADA' || solicitud.estado === 'CANCELADA') {
    throw new Error('No se puede modificar una solicitud en estado final');
  }

  if (data.estado && !ESTADOS_PERMITIDOS.includes(data.estado)) {
    throw new Error('Estado de impresión no válido');
  }

  const payload = {
    ...(data.estado ? { estado: data.estado } : {}),
    ...(data.observacionAyudante
      ? { observacionAyudante: data.observacionAyudante }
      : {}),
    ...(data.motivoRechazo ? { motivoRechazo: data.motivoRechazo } : {}),
    ...(data.tiempoEstimadoImpresion
      ? { tiempoEstimadoImpresion: data.tiempoEstimadoImpresion }
      : {}),
    refAyudante: usuario.id,
  };

  const solicitudActualizada = await prisma.impresion.update({
    where: {
      id: impresionId,
    },
    data: payload,
  });

  const usuarioActor = await prisma.usuario.findUnique({
    where: { id: usuario.id },
    select: {
      nombre: true,
      apellido: true,
      correo: true,
    },
  });

  const nombreActor = [
    usuarioActor ? usuarioActor.nombre : '',
    usuarioActor ? usuarioActor.apellido : '',
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  if (data.estado && data.estado !== solicitud.estado) {
    const correoDestino =
      (solicitud.estudiante ? solicitud.estudiante.correo : null) ||
      solicitud.solicitanteCorreo;

    if (correoDestino) {
      try {
        await enviarCorreoCambioEstadoSolicitud({
          destinatario: correoDestino,
          nombreDestinatario:
            (solicitud.estudiante ? solicitud.estudiante.nombre : null) ||
            solicitud.solicitanteNombre ||
            'estudiante',
          estadoAnterior: solicitud.estado,
          estadoNuevo: data.estado,
          nombreCurso: solicitud.nombreCurso,
          solicitudId: solicitud.id,
          replyTo: usuarioActor ? usuarioActor.correo : null,
          nombreRemitente: nombreActor || 'equipo docente',
        });
      } catch (error) {
        process.stderr.write(
          `[EmailService] Error al enviar correo de cambio de estado: ${
            error.message || error
          }\n`
        );
      }
    }
  }

  return solicitudActualizada;
};

module.exports = {
  obtenerMisCursos,
  obtenerSolicitudes,
  actualizarSolicitud,
};
