const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const crearImpresion = async (usuario, datos) => {
  const rolUsuario = usuario.rol || usuario.usuarioRol;

  if (rolUsuario !== 'ESTUDIANTE' && rolUsuario !== 'SOLICITANTE') {
    throw new Error('Solo estudiantes o solicitantes pueden crear solicitudes');
  }

  const nuevaImpresion = await prisma.impresion.create({
    data: {
      refEstudiante: rolUsuario === 'ESTUDIANTE' ? usuario.id : null,
      tipoUsuario: rolUsuario,
      tipoSolicitud: datos.tipoSolicitud,
      nombreCurso: datos.nombreCurso,
      refCurso: datos.refCurso || null,
      colorOpcion1: datos.colorOpcion1,
      colorOpcion2: datos.colorOpcion2,
      colorOpcion3: datos.colorOpcion3,
      urlModelo3d: datos.urlModelo3d,
      urlModeloStl: datos.urlModeloStl,
      comentario: datos.comentario,
      estado: 'PENDIENTE',
    },
  });

  return nuevaImpresion;
};
const obtenerImpresiones = async (usuario) => {
  const rolUsuario = usuario.rol || usuario.usuarioRol;

  // 1. ADMINISTRADOR: Puede ver todo el historial de la universidad
  if (rolUsuario === 'ADMINISTRADOR') {
    return prisma.impresion.findMany({
      orderBy: { creadoEn: 'desc' },
    });
  }

  // 2. ESTUDIANTE o SOLICITANTE: Solo ven las solicitudes que ellos mismos crearon
  if (rolUsuario === 'ESTUDIANTE' || rolUsuario === 'SOLICITANTE') {
    return prisma.impresion.findMany({
      where: { refEstudiante: usuario.id },
      orderBy: { creadoEn: 'desc' },
    });
  }

  // 3. PROFESOR: Solo ve solicitudes atadas a los cursos donde él es el profesor
  if (rolUsuario === 'PROFESOR') {
    return prisma.impresion.findMany({
      where: {
        curso: {
          refProfesor: usuario.id,
        },
      },
      orderBy: { creadoEn: 'desc' },
    });
  }

  // 4. AYUDANTE: Solo ve solicitudes de los cursos en los que imparte ayudantías,
  // o aquellas impresiones que ya tomó/tiene asignadas.
  if (rolUsuario === 'AYUDANTE') {
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
            refAyudante: usuario.id,
          },
        ],
      },
      orderBy: { creadoEn: 'desc' },
    });
  }

  throw new Error('Usuario no tiene permisos para ver impresiones');
};

const cambiarEstadoImpresion = async (usuario, impresionId, nuevoEstado) => {
  // validaciones de rol...

  const estadosPermitidos = [
    'PENDIENTE',
    'EN_PROCESO',
    'COMPLETADA',
    'CANCELADA',
  ];

  if (!estadosPermitidos.includes(nuevoEstado)) {
    throw new Error('Estado de impresión no válido');
  }

  const impresionExistente = await prisma.impresion.findUnique({
    where: { id: impresionId },
  });

  if (!impresionExistente) {
    throw new Error('Solicitud de impresión no encontrada');
  }

  if (
    impresionExistente.estado === 'COMPLETADA' ||
    impresionExistente.estado === 'CANCELADA'
  ) {
    throw new Error('No se puede modificar una solicitud en estado final');
  }

  const impresionActualizada = await prisma.impresion.update({
    where: { id: impresionId },
    data: {
      estado: nuevoEstado,
      refAyudante: usuario.id,
    },
  });

  return impresionActualizada;
};

module.exports = {
  crearImpresion,
  obtenerImpresiones,
  cambiarEstadoImpresion,
};
