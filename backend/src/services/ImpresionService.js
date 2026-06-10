const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const crearImpresion = async (usuario, datos) => {
  if (usuario.rol !== 'ESTUDIANTE' && usuario.rol !== 'SOLICITANTE') {
    throw new Error('Solo estudiantes o solicitantes pueden crear solicitudes');
  }

  const nuevaImpresion = await prisma.impresion.create({
    data: {
      refEstudiante: usuario.rol === 'ESTUDIANTE' ? usuario.id : null,
      tipoUsuario: usuario.rol,
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
  if (usuario.rol === 'ADMINISTRADOR' || usuario.rol === 'AYUDANTE') {
    return prisma.impresion.findMany({
      orderBy: { creadoEn: 'desc' },
    });
  }

  if (usuario.rol === 'ESTUDIANTE') {
    return prisma.impresion.findMany({
      where: { refEstudiante: usuario.id },
      orderBy: { creadoEn: 'desc' },
    });
  }

  throw new Error('Usuario no tiene permisos para ver impresiones');
};

module.exports = {
  crearImpresion,
  obtenerImpresiones,
};
