const mockPrisma = require('../prismaMock');
const usoImpresionService = require('../../src/services/UsoImpresionService');

describe('Prueba para crear un uso de impresión', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Debería arrojar un error si el usuario no es ADMINISTRADOR ni AYUDANTE', async () => {
    const usuarioEstudiante = { rol: 'ESTUDIANTE' };

    await expect(
      usoImpresionService.crearUsoImpresion(usuarioEstudiante, {})
    ).rejects.toThrow('Usuario no tiene los permisos necesarios.');
  });

  it('Debería arrojar un error si la impresión no existe', async () => {
    const usuarioAdmin = { rol: 'ADMINISTRADOR' };

    mockPrisma.impresion.findUnique.mockResolvedValue(null);

    await expect(
      usoImpresionService.crearUsoImpresion(usuarioAdmin, {
        refImpresion: 'id-inexistente',
        refSemestre: 'sem-1',
        refArticulo: 'art-1',
        cantidadFilamento: 10,
      })
    ).rejects.toThrow('La impresión no existe en la base de datos');
  });

  it('Debería arrojar un error si el semestre no existe', async () => {
    const usuarioAdmin = { rol: 'ADMINISTRADOR' };

    mockPrisma.impresion.findUnique.mockResolvedValue({ id: 'imp-1' });
    mockPrisma.semestre.findUnique.mockResolvedValue(null);

    await expect(
      usoImpresionService.crearUsoImpresion(usuarioAdmin, {
        refImpresion: 'imp-1',
        refSemestre: 'sem-inexistente',
        refArticulo: 'art-1',
        cantidadFilamento: 10,
      })
    ).rejects.toThrow('El semestre no existe en la base de datos');
  });

  it('Debería arrojar un error si el artículo no existe', async () => {
    const usuarioAdmin = { rol: 'ADMINISTRADOR' };

    mockPrisma.impresion.findUnique.mockResolvedValue({ id: 'imp-1' });
    mockPrisma.semestre.findUnique.mockResolvedValue({ id: 'sem-1' });
    mockPrisma.articulo.findUnique.mockResolvedValue(null);

    await expect(
      usoImpresionService.crearUsoImpresion(usuarioAdmin, {
        refImpresion: 'imp-1',
        refSemestre: 'sem-1',
        refArticulo: 'art-inexistente',
        cantidadFilamento: 10,
      })
    ).rejects.toThrow('El artículo no existe en la base de datos');
  });

  it('Debería crear un uso de impresión con éxito', async () => {
    const usuarioAyudante = { rol: 'AYUDANTE' };
    const datos = {
      refImpresion: 'imp-1',
      refSolicitante: 'sol-1',
      refEstudiante: null,
      refSemestre: 'sem-1',
      cantidadFilamento: 50,
      refArticulo: 'art-1',
    };

    const mockCreado = {
      id: 'uso-1',
      ...datos,
      creadoEn: new Date(),
      actualizadoEn: new Date(),
    };

    mockPrisma.impresion.findUnique.mockResolvedValue({ id: 'imp-1' });
    mockPrisma.semestre.findUnique.mockResolvedValue({ id: 'sem-1' });
    mockPrisma.articulo.findUnique.mockResolvedValue({ id: 'art-1' });
    mockPrisma.usoImpresion.create.mockResolvedValue(mockCreado);

    const resultado = await usoImpresionService.crearUsoImpresion(
      usuarioAyudante,
      datos
    );

    expect(mockPrisma.usoImpresion.create).toHaveBeenCalledTimes(1);
    expect(resultado.id).toBe('uso-1');
    expect(resultado.cantidadFilamento).toBe(50);
  });
});

describe('Prueba para obtener todos los usos de impresión', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('Debería retornar la lista con datos de material enfocados', async () => {
    const mockUsosImpresion = [
      {
        id: 'uso-1',
        refImpresion: 'imp-1',
        refSemestre: 'sem-1',
        cantidadFilamento: 50,
        refArticulo: 'art-1',
        impresion: { id: 'imp-1', estado: 'PENDIENTE' },
        articulo: {
          id: 'art-1',
          nombreArticulo: 'PLA Blanco',
          unidadMedida: 'gramos',
        },
        semestre: { id: 'sem-1', anio: 2026, periodo: 1 },
        solicitante: {
          id: 'sol-1',
          nombre: 'Juan',
          apellido: 'Pérez',
          correo: 'juan@test.com',
          rut: '12345678-9',
        },
        estudiante: null,
      },
      {
        id: 'uso-2',
        refImpresion: 'imp-2',
        refSemestre: 'sem-1',
        cantidadFilamento: 30,
        refArticulo: 'art-2',
        impresion: { id: 'imp-2', estado: 'EN_PROCESO' },
        articulo: {
          id: 'art-2',
          nombreArticulo: 'PETG Negro',
          unidadMedida: 'gramos',
        },
        semestre: { id: 'sem-1', anio: 2026, periodo: 1 },
        solicitante: null,
        estudiante: {
          id: 'est-1',
          nombre: 'María',
          apellido: 'López',
          correo: 'maria@test.com',
          rut: '98765432-1',
        },
      },
    ];
    mockPrisma.usoImpresion.findMany.mockResolvedValue(mockUsosImpresion);
    const resultadoObtenido = await usoImpresionService.obtenerUsosImpresion();
    expect(mockPrisma.usoImpresion.findMany).toHaveBeenCalledTimes(1);
    expect(resultadoObtenido).toHaveLength(2);
    expect(resultadoObtenido[0].id).toBe('uso-1');
    expect(resultadoObtenido[0].cantidadFilamento).toBe(50);
    expect(resultadoObtenido[0].refArticulo).toBe('art-1');
    expect(resultadoObtenido[0].articulo.nombreArticulo).toBe('PLA Blanco');
    expect(resultadoObtenido[1].id).toBe('uso-2');
    expect(resultadoObtenido[1].cantidadFilamento).toBe(30);
    expect(resultadoObtenido[1].refArticulo).toBe('art-2');
    expect(resultadoObtenido[1].articulo.nombreArticulo).toBe('PETG Negro');
  });
});

describe('Prueba para obtener un uso de impresión por ID', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('Debería retornar un uso de impresión con datos de material utilizado', async () => {
    const mockUsoImpresion = {
      id: 'uso-1',
      refImpresion: 'imp-1',
      refSemestre: 'sem-1',
      cantidadFilamento: 50,
      refArticulo: 'art-1',
      impresion: {
        id: 'imp-1',
        estado: 'PENDIENTE',
        tipoSolicitud: 'PERSONAL',
        comentario: 'Pieza de prueba',
      },
      articulo: {
        id: 'art-1',
        nombreArticulo: 'PLA Blanco',
        unidadMedida: 'gramos',
      },
      semestre: { id: 'sem-1', anio: 2026, periodo: 1 },
      solicitante: {
        id: 'sol-1',
        nombre: 'Juan',
        apellido: 'Pérez',
        correo: 'juan@test.com',
        rut: '12345678-9',
      },
      estudiante: null,
    };
    mockPrisma.usoImpresion.findUnique.mockResolvedValue(mockUsoImpresion);
    const resultadoObtenido =
      await usoImpresionService.obtenerUsoImpresionPorId('uso-1');
    expect(mockPrisma.usoImpresion.findUnique).toHaveBeenCalledTimes(1);
    expect(resultadoObtenido.id).toBe('uso-1');
    expect(resultadoObtenido.cantidadFilamento).toBe(50);
    expect(resultadoObtenido.articulo.nombreArticulo).toBe('PLA Blanco');
    expect(resultadoObtenido.impresion.id).toBe('imp-1');
    expect(resultadoObtenido.solicitante.nombre).toBe('Juan');
  });
  it('Debería arrojar un error si el uso de impresión no existe', async () => {
    mockPrisma.usoImpresion.findUnique.mockResolvedValue(null);
    await expect(
      usoImpresionService.obtenerUsoImpresionPorId('id-inexistente')
    ).rejects.toThrow('El uso de impresión no existe en la base de datos');
  });
});

describe('Prueba para actualizar un uso de impresión', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Debería arrojar un error si el usuario no es ADMINISTRADOR ni AYUDANTE', async () => {
    const usuarioEstudiante = { rol: 'ESTUDIANTE' };

    await expect(
      usoImpresionService.actualizarUsoImpresion(usuarioEstudiante, 'uso-1', {
        cantidadFilamento: 100,
      })
    ).rejects.toThrow('Usuario no tiene los permisos necesarios.');
  });

  it('Debería arrojar un error si el uso de impresión no existe', async () => {
    const usuarioAdmin = { rol: 'ADMINISTRADOR' };

    mockPrisma.usoImpresion.findUnique.mockResolvedValue(null);

    await expect(
      usoImpresionService.actualizarUsoImpresion(usuarioAdmin, 'id-999', {
        cantidadFilamento: 100,
      })
    ).rejects.toThrow('El uso de impresión no existe en la base de datos');
  });

  it('Debería actualizar el uso de impresión con éxito', async () => {
    const usuarioAdmin = { rol: 'ADMINISTRADOR' };
    const datosActualizar = { cantidadFilamento: 100 };

    const mockExistente = {
      id: 'uso-1',
      cantidadFilamento: 50,
    };
    const mockActualizado = { id: 'uso-1', cantidadFilamento: 100 };

    mockPrisma.usoImpresion.findUnique.mockResolvedValue(mockExistente);
    mockPrisma.usoImpresion.update.mockResolvedValue(mockActualizado);

    const resultado = await usoImpresionService.actualizarUsoImpresion(
      usuarioAdmin,
      'uso-1',
      datosActualizar
    );

    expect(mockPrisma.usoImpresion.update).toHaveBeenCalledTimes(1);
    expect(resultado.mensaje).toBe('Uso de impresión actualizado con éxito');
    expect(resultado.usoImpresionActualizado.cantidadFilamento).toBe(100);
  });
});

describe('Prueba para eliminar un uso de impresión', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Debería arrojar un error si el usuario no es ADMINISTRADOR ni AYUDANTE', async () => {
    const usuarioEstudiante = { rol: 'ESTUDIANTE' };

    await expect(
      usoImpresionService.eliminarUsoImpresion(usuarioEstudiante, 'uso-1')
    ).rejects.toThrow('Usuario no tiene los permisos necesarios.');
  });

  it('Debería arrojar un error si el uso de impresión no existe', async () => {
    const usuarioAdmin = { rol: 'ADMINISTRADOR' };

    mockPrisma.usoImpresion.findUnique.mockResolvedValue(null);

    await expect(
      usoImpresionService.eliminarUsoImpresion(usuarioAdmin, 'id-999')
    ).rejects.toThrow('El uso de impresión no existe en la base de datos');
  });

  it('Debería eliminar el uso de impresión con éxito', async () => {
    const usuarioAyudante = { rol: 'AYUDANTE' };
    const mockEliminado = { id: 'uso-1', cantidadFilamento: 50 };

    mockPrisma.usoImpresion.findUnique.mockResolvedValue(mockEliminado);
    mockPrisma.usoImpresion.delete.mockResolvedValue(mockEliminado);

    const resultado = await usoImpresionService.eliminarUsoImpresion(
      usuarioAyudante,
      'uso-1'
    );

    expect(mockPrisma.usoImpresion.delete).toHaveBeenCalledTimes(1);
    expect(mockPrisma.usoImpresion.delete).toHaveBeenCalledWith({
      where: { id: 'uso-1' },
    });
    expect(resultado.id).toBe('uso-1');
  });
});

describe('Prueba para obtener materiales de una impresión', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('Debería retornar los materiales usados en una impresión específica', async () => {
    const mockUsos = [
      {
        id: 'uso-1',
        refImpresion: 'imp-1',
        cantidadFilamento: 50,
        articulo: {
          id: 'art-1',
          nombreArticulo: 'PLA Blanco',
          unidadMedida: 'gramos',
        },
        solicitante: {
          id: 'sol-1',
          nombre: 'Juan',
          apellido: 'Pérez',
          correo: 'juan@test.com',
          rut: '12345678-9',
        },
        estudiante: null,
      },
      {
        id: 'uso-2',
        refImpresion: 'imp-1',
        cantidadFilamento: 30,
        articulo: {
          id: 'art-2',
          nombreArticulo: 'PETG Negro',
          unidadMedida: 'gramos',
        },
        solicitante: null,
        estudiante: {
          id: 'est-1',
          nombre: 'María',
          apellido: 'López',
          correo: 'maria@test.com',
          rut: '98765432-1',
        },
      },
    ];
    mockPrisma.usoImpresion.findMany.mockResolvedValue(mockUsos);
    const resultadoObtenido =
      await usoImpresionService.obtenerUsosImpresionPorImpresion('imp-1');
    expect(mockPrisma.usoImpresion.findMany).toHaveBeenCalledTimes(1);
    expect(resultadoObtenido).toHaveLength(2);
    expect(resultadoObtenido[0].refImpresion).toBe('imp-1');
    expect(resultadoObtenido[0].articulo.nombreArticulo).toBe('PLA Blanco');
    expect(resultadoObtenido[0].cantidadFilamento).toBe(50);
    expect(resultadoObtenido[1].articulo.nombreArticulo).toBe('PETG Negro');
    expect(resultadoObtenido[1].cantidadFilamento).toBe(30);
  });
});
