const prisma = require('../prismaMock');
const MovimientoStockService = require('../../src/services/MovimientoStockService');

describe('MovimientoStockService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deberia crear y retornar el movimiento stock con exito', async () => {
    const datosNuevoMovimiento = {
      refArticulo: 'articulo-1',
      refUsuario: 'usuario-1',
      tipoMovimiento: 'ENTRADA',
      cambioStock: 10,
      stockResultante: 10,
    };

    const movimientoEsperado = {
      id: 'movimiento-123',
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

  it('deberia obtener todos los movimientos de stock con exito', async () => {
    const movimientosEsperados = [
      {
        id: '1',
        refArticulo: 'articulo-1',
        refUsuario: 'usuario-1',
        tipoMovimiento: 'ENTRADA',
        cambioStock: 10,
        stockResultante: 10,
      },
      {
        id: '2',
        refArticulo: 'articulo-2',
        refUsuario: 'usuario-2',
        tipoMovimiento: 'SALIDA',
        cambioStock: 5,
        stockResultante: 10,
      },
    ];

    prisma.movimientoStock.findMany.mockResolvedValue(movimientosEsperados);
    const resultado = await MovimientoStockService.obtenerMovimientosStock();

    expect(prisma.movimientoStock.findMany).toHaveBeenCalledWith();
    expect(resultado).toEqual(movimientosEsperados);
    expect(resultado).toHaveLength(2);
  });
});
