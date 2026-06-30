const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const crearMovimientoStock = async (datosNuevoMovimiento) => {
  const movimientoStock = await prisma.movimientoStock.create({
    data: datosNuevoMovimiento,
  });
  return movimientoStock;
};

module.exports = {
  crearMovimientoStock,
};
