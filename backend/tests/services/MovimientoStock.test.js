const MovimientoStockService = require('../../src/services/MovimientoStockService');
const prisma = require('../prismaMock');

describe('MovimientoStockService', () => {
  it('deberia crear y retornar el movimiento stock con exito', async () => {
    const datosNuevoMovimiento = {
      refArticulo: 'articulo-1',
      refUsuario: 'usuario-1',
      tipoMovimiento: 'ENTRADA',
      cambioStock: 10,
    };

    const movimientoEsperado = {
      if: 'movimiento-123',
      ...datosNuevoMovimiento,
      stockResultante: 10,
    };

    prisma.movimientoStock.create.mockResolvedValue(movimientoEsperado);

    const resultado =
      await MovimientoStockService.crearMovimientoStock(datosNuevoMovimiento);

    expect(prisma.movimientoStock.create).toHaveBeenCalledWith({
      data: datosNuevoMovimiento,
    });

    expect(resultado).toEqual(movimientoEsperado);
  });
});
