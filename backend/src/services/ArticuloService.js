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

module.exports = {
  crearArticulo,
  eliminarArticulo,
  obtenerArticulos,
};
