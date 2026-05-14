const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mockPrisma = require('../prismaMock');
const usuarioService = require('../../src/services/UsuarioService');

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('UsuarioService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registrarUsuario', () => {
    it('Debería lanzar error si el correo ya existe', async () => {
      mockPrisma.usuario.findUnique.mockResolvedValue({
        id: 1,
        correo: 'test@utalca.cl',
      });

      await expect(
        usuarioService.registrarUsuario(
          '111-1',
          'Juan',
          'Perez',
          'test@utalca.cl',
          'Pass123!',
          'ESTUDIANTE'
        )
      ).rejects.toThrow('El correo ya está registrado');
    });

    it('Debería registrar un usuario correctamente', async () => {
      mockPrisma.usuario.findUnique.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedPassword');

      const usuarioMock = {
        rut: '111-1',
        nombre: 'Juan',
        apellido: 'Perez',
        correo: 'test@utalca.cl',
        usuarioRol: 'ESTUDIANTE',
      };
      mockPrisma.usuario.create.mockResolvedValue(usuarioMock);

      const resultado = await usuarioService.registrarUsuario(
        '111-1',
        'Juan',
        'Perez',
        'test@utalca.cl',
        'Pass123!',
        'ESTUDIANTE'
      );

      expect(resultado.email).toBe('test@utalca.cl');
      expect(mockPrisma.usuario.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('loginUsuario', () => {
    it('Debería lanzar error si el correo no está registrado', async () => {
      mockPrisma.usuario.findUnique.mockResolvedValue(null);

      await expect(
        usuarioService.loginUsuario('noexiste@utalca.cl', 'pass')
      ).rejects.toThrow('Correo no registrado');
    });

    it('Debería retornar un token si las credenciales son correctas', async () => {
      const usuarioMock = {
        id: 1,
        nombre: 'Juan',
        apellido: 'Perez',
        correo: 'test@utalca.cl',
        passUsuario: 'hashed',
        usuarioRol: 'ESTUDIANTE',
      };
      mockPrisma.usuario.findUnique.mockResolvedValue(usuarioMock);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('fake-jwt-token');

      const resultado = await usuarioService.loginUsuario(
        'test@utalca.cl',
        'password'
      );

      expect(resultado.token).toBe('fake-jwt-token');
      expect(resultado.usuario.nombre).toBe('Juan');
    });
  });

  describe('eliminarUsuario', () => {
    it('Debería lanzar error si el usuario no es ADMINISTRADOR', async () => {
      const usuarioLogueado = { rol: 'ESTUDIANTE' };
      await expect(
        usuarioService.eliminarUsuario(usuarioLogueado, 'test@utalca.cl')
      ).rejects.toThrow('El usuario no tiene los permisos necesarios');
    });
  });
});
