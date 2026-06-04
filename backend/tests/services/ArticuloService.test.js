const mockPrisma = require('../prismaMock');
const articuloService = require('../../src/services/ArticuloService');

describe('Prueba para obtener todos los articulos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Debería retornar la lista con todos los articulos', async () => {
    const mockArticulos = [
      {
        id: 1,
        nombreArticulo: 'Articulo 1',
        stockActual: 10,
        unidadMedida: 'kg',
        alertaStock: 5,
        notificarStock: true,
      },
      {
        id: 2,
        nombreArticulo: 'Articulo 2',
        stockActual: 20,
        unidadMedida: 'kg',
        alertaStock: 10,
        notificarStock: false,
      },
    ];

    mockPrisma.articulo.findMany.mockResolvedValue(mockArticulos);

    const resultadoObtenido = await articuloService.obtenerArticulos();

    expect(mockPrisma.articulo.findMany).toHaveBeenCalledTimes(1);
    expect(resultadoObtenido).toHaveLength(2);
    expect(resultadoObtenido[0].nombreArticulo).toBe('Articulo 1');
    expect(resultadoObtenido[1].nombreArticulo).toBe('Articulo 2');
  });
});

describe('Prueba para obtener un articulo por ID', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Debería retornar un articulo por su ID', async () => {
    const mockArticulo = {
      id: 1,
      nombreArticulo: 'Articulo Test',
      stockActual: 15,
      unidadMedida: 'kg',
      alertaStock: 7,
      notificarStock: true,
    };

    mockPrisma.articulo.findUnique.mockResolvedValue(mockArticulo);

    const resultadoObtenido = await articuloService.obtenerArticuloPorId(1);

    expect(mockPrisma.articulo.findUnique).toHaveBeenCalledTimes(1);
    expect(mockPrisma.articulo.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(resultadoObtenido.nombreArticulo).toBe('Articulo Test');
    expect(resultadoObtenido.id).toBe(1);
  });
});
