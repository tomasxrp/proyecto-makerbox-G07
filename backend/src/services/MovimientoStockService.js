const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const crearMovimientoStock = async (datosNuevoMovimiento) => {
  const movimientoStock = await prisma.movimientoStock.create({
    data: datosNuevoMovimiento,
  });
  return movimientoStock;
};

const obtenerMovimientosStock = async () => {
  const movimientos = await prisma.movimientoStock.findMany();
  return movimientos;
};

module.exports = {
  crearMovimientoStock,
  obtenerMovimientosStock,
};
