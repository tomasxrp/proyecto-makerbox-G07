const mockPrisma = {
  semestre: {
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
  },
  articulo: {
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  usuario: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
  },
  curso: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
  bloqueHorario: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
  reserva: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  bloqueReservado: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  estudianteCurso: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
  grupoCurso: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
  impresion: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  usoImpresion: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  ayudantia: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  grupoEstudiante: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  movimientoStock: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

module.exports = mockPrisma;
