const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const crearArticulo = async (
  usuario,
  nombreArticulo,
  stockActual,
  unidadMedida,
  alertaStock,
  notificarStock
) => {
  if (usuario.rol !== 'ADMINISTRADOR') {
    throw new Error('Usuario no tiene los permisos necesarios.');
  }

  const articulo = await prisma.articulo.create({
    data: {
      nombreArticulo,
      stockActual,
      unidadMedida,
      alertaStock,
      notificarStock,
    },
  });

  return articulo;
};

const eliminarArticulo = async (usuario, articuloId) => {
  if (usuario.rol !== 'ADMINISTRADOR') {
    throw new Error('Usuario no tiene los permisos necesarios.');
  }

  const articuloEncontrado = await prisma.articulo.findUnique({
    where: {
      id: articuloId,
    },
  });

  if (!articuloEncontrado) {
    throw new Error('El articulo no existe en la base de datos');
  }

  const articuloEliminado = await prisma.articulo.delete({
    where: {
      id: articuloId,
    },
  });

  return articuloEliminado;
};

const obtenerArticulos = async () => {
  const articulos = await prisma.articulo.findMany();
  return articulos;
};

const obtenerArticuloPorId = async (articuloId) => {
  const articuloEncontrado = await prisma.articulo.findUnique({
    where: {
      id: articuloId,
    },
  });

  if (!articuloEncontrado) {
    throw new Error('El articulo no existe en la base de datos');
  }

  return articuloEncontrado;
};

const actualizarArticulo = async (usuario, articuloId, datosActualizar) => {
  if (usuario.rol !== 'ADMINISTRADOR') {
    throw new Error('Usuario no tiene los permisos necesarios.');
  }

  const articuloEncontrado = await prisma.articulo.findUnique({
    where: {
      id: articuloId,
    },
  });

  if (!articuloEncontrado) {
    throw new Error('El artículo no existe en la base de datos');
  }

  const articuloActualizado = await prisma.articulo.update({
    where: {
      id: articuloId,
    },
    data: datosActualizar,
  });

  return {
    mensaje: 'Artículo actualizado con éxito',
    articuloActualizado,
  };
};

module.exports = {
  crearArticulo,
  eliminarArticulo,
  obtenerArticulos,
  obtenerArticuloPorId,
  actualizarArticulo,
};
