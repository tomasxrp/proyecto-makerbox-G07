const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const crearUsoImpresion = async (usuario, datos) => {
  if (usuario.rol !== 'ADMINISTRADOR' && usuario.rol !== 'AYUDANTE') {
    throw new Error('Usuario no tiene los permisos necesarios.');
  }

  const impresionEncontrada = await prisma.impresion.findUnique({
    where: { id: datos.refImpresion },
  });

  if (!impresionEncontrada) {
    throw new Error('La impresión no existe en la base de datos');
  }

  const semestreEncontrado = await prisma.semestre.findUnique({
    where: { id: datos.refSemestre },
  });

  if (!semestreEncontrado) {
    throw new Error('El semestre no existe en la base de datos');
  }

  const articuloEncontrado = await prisma.articulo.findUnique({
    where: { id: datos.refArticulo },
  });

  if (!articuloEncontrado) {
    throw new Error('El artículo no existe en la base de datos');
  }

  const nuevoUsoImpresion = await prisma.usoImpresion.create({
    data: {
      refImpresion: datos.refImpresion,
      refSolicitante: datos.refSolicitante || null,
      refEstudiante: datos.refEstudiante || null,
      refSemestre: datos.refSemestre,
      cantidadFilamento: datos.cantidadFilamento,
      refArticulo: datos.refArticulo,
    },
    include: {
      impresion: true,
      semestre: true,
      articulo: true,
      solicitante: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          correo: true,
        },
      },
      estudiante: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          correo: true,
        },
      },
    },
  });

  return nuevoUsoImpresion;
};

const obtenerUsosImpresion = async () => {
  const usosImpresion = await prisma.usoImpresion.findMany({
    include: {
      impresion: {
        select: {
          id: true,
          estado: true,
        },
      },
      articulo: {
        select: {
          id: true,
          nombreArticulo: true,
          unidadMedida: true,
        },
      },
      semestre: {
        select: {
          id: true,
          anio: true,
          periodo: true,
        },
      },
      solicitante: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          correo: true,
          rut: true,
        },
      },
      estudiante: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          correo: true,
          rut: true,
        },
      },
    },
    orderBy: { creadoEn: 'desc' },
  });
  return usosImpresion;
};

const obtenerUsoImpresionPorId = async (usoImpresionId) => {
  const usoImpresionEncontrado = await prisma.usoImpresion.findUnique({
    where: { id: usoImpresionId },
    include: {
      impresion: {
        select: {
          id: true,
          estado: true,
          tipoSolicitud: true,
          comentario: true,
        },
      },
      articulo: {
        select: {
          id: true,
          nombreArticulo: true,
          unidadMedida: true,
        },
      },
      semestre: {
        select: {
          id: true,
          anio: true,
          periodo: true,
        },
      },
      solicitante: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          correo: true,
          rut: true,
        },
      },
      estudiante: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          correo: true,
          rut: true,
        },
      },
    },
  });
  if (!usoImpresionEncontrado) {
    throw new Error('El uso de impresión no existe en la base de datos');
  }
  return usoImpresionEncontrado;
};

const actualizarUsoImpresion = async (
  usuario,
  usoImpresionId,
  datosActualizar
) => {
  if (usuario.rol !== 'ADMINISTRADOR' && usuario.rol !== 'AYUDANTE') {
    throw new Error('Usuario no tiene los permisos necesarios.');
  }

  const usoImpresionEncontrado = await prisma.usoImpresion.findUnique({
    where: { id: usoImpresionId },
  });

  if (!usoImpresionEncontrado) {
    throw new Error('El uso de impresión no existe en la base de datos');
  }

  const usoImpresionActualizado = await prisma.usoImpresion.update({
    where: { id: usoImpresionId },
    data: datosActualizar,
    include: {
      impresion: true,
      semestre: true,
      articulo: true,
      solicitante: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          correo: true,
        },
      },
      estudiante: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          correo: true,
        },
      },
    },
  });

  return {
    mensaje: 'Uso de impresión actualizado con éxito',
    usoImpresionActualizado,
  };
};

const eliminarUsoImpresion = async (usuario, usoImpresionId) => {
  if (usuario.rol !== 'ADMINISTRADOR' && usuario.rol !== 'AYUDANTE') {
    throw new Error('Usuario no tiene los permisos necesarios.');
  }

  const usoImpresionEncontrado = await prisma.usoImpresion.findUnique({
    where: { id: usoImpresionId },
  });

  if (!usoImpresionEncontrado) {
    throw new Error('El uso de impresión no existe en la base de datos');
  }

  const usoImpresionEliminado = await prisma.usoImpresion.delete({
    where: { id: usoImpresionId },
  });

  return usoImpresionEliminado;
};

module.exports = {
  crearUsoImpresion,
  obtenerUsosImpresion,
  obtenerUsoImpresionPorId,
  actualizarUsoImpresion,
  eliminarUsoImpresion,
};
