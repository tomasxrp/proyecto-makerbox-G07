const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const rolesAutorizados = [
  'ADMINISTRADOR',
  'AYUDANTE',
  'PROFESOR',
  'ESTUDIANTE',
  'SOLICITANTE',
];

const crearImpresion = async (usuario, datos) => {
  if (!rolesAutorizados.includes(usuario.rol)) {
    throw new Error('El usuario no tiene permisos para crear una impresion');
  }

  const refEstudiante =
    usuario.rol === 'ESTUDIANTE' && !datos.refEstudiante
      ? usuario.id
      : datos.refEstudiante || null;

  const tipoUsuario = datos.tipoUsuario || usuario.rol;

  const nuevaImpresion = await prisma.impresion.create({
    data: {
      solicitanteNombre: datos.solicitanteNombre,
      solicitanteApellido: datos.solicitanteApellido,
      solicitanteCorreo: datos.solicitanteCorreo,
      solicitanteRut: datos.solicitanteRut,
      refEstudiante,
      refAyudante: datos.refAyudante,
      tipoUsuario,
      tipoSolicitud: datos.tipoSolicitud,
      nombreCurso: datos.nombreCurso,
      refCurso: datos.refCurso,
      colorOpcion1: datos.colorOpcion1,
      colorOpcion2: datos.colorOpcion2,
      colorOpcion3: datos.colorOpcion3,
      comentarioTecnico: datos.comentarioTecnico,
      urlModelo3d: datos.urlModelo3d,
      urlModeloStl: datos.urlModeloStl,
      comentario: datos.comentario,
      tiempoEstimadoImpresion: datos.tiempoEstimadoImpresion,
      estado: datos.estado,
    },
    include: {
      estudiante: true,
      ayudante: true,
      curso: true,
    },
  });

  return {
    mensaje: 'Impresion creada con exito',
    impresion: nuevaImpresion,
  };
};

const obtenerImpresiones = async (usuario) => {
  const where = {};

  if (usuario.rol === 'ESTUDIANTE') {
    where.refEstudiante = usuario.id;
  }

  if (usuario.rol === 'SOLICITANTE') {
    where.tipoUsuario = 'SOLICITANTE';
  }

  const impresiones = await prisma.impresion.findMany({
    where,
    orderBy: {
      creadoEn: 'desc',
    },
    include: {
      estudiante: true,
      ayudante: true,
      curso: true,
    },
  });

  return impresiones;
};

const obtenerImpresionPorId = async (usuario, impresionId) => {
  const impresion = await prisma.impresion.findUnique({
    where: {
      id: impresionId,
    },
    include: {
      estudiante: true,
      ayudante: true,
      curso: true,
    },
  });

  if (!impresion) {
    throw new Error('La impresion no existe en la base de datos');
  }

  if (usuario.rol === 'ESTUDIANTE' && impresion.refEstudiante !== usuario.id) {
    throw new Error('El usuario no tiene permisos para ver esta impresion');
  }

  if (
    usuario.rol === 'SOLICITANTE' &&
    impresion.tipoUsuario !== 'SOLICITANTE'
  ) {
    throw new Error('El usuario no tiene permisos para ver esta impresion');
  }

  return impresion;
};

const actualizarEstadoImpresion = async (usuario, impresionId, datos) => {
  if (!['ADMINISTRADOR', 'AYUDANTE'].includes(usuario.rol)) {
    throw new Error('El usuario no tiene permisos para actualizar impresiones');
  }

  const impresion = await prisma.impresion.findUnique({
    where: {
      id: impresionId,
    },
  });

  if (!impresion) {
    throw new Error('La impresion no existe en la base de datos');
  }

  const impresionActualizada = await prisma.impresion.update({
    where: {
      id: impresionId,
    },
    data: {
      estado: datos.estado,
      observacionAyudante: datos.observacionAyudante,
      motivoRechazo: datos.motivoRechazo,
      comentarioTecnico: datos.comentarioTecnico,
      tiempoEstimadoImpresion: datos.tiempoEstimadoImpresion,
      inicioImpresion: datos.inicioImpresion
        ? new Date(datos.inicioImpresion)
        : undefined,
      refAyudante: datos.refAyudante || usuario.id,
    },
    include: {
      estudiante: true,
      ayudante: true,
      curso: true,
    },
  });

  return {
    mensaje: 'Estado de impresion actualizado con exito',
    impresion: impresionActualizada,
  };
};

module.exports = {
  crearImpresion,
  obtenerImpresiones,
  obtenerImpresionPorId,
  actualizarEstadoImpresion,
};
