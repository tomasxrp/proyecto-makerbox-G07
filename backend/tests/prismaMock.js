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
  },
  usuario: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

module.exports = mockPrisma;
