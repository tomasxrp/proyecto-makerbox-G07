// eslint-disable-next-line
const mockPrisma = require('../prismaMock');

const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../../src/index'); // Tu servidor Express

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('Prueba de integracion API usuarios', () => {
  beforeEach(() => {
    // Limpiar mocks creados previamente
    jest.clearAllMocks();
  });

  describe('POST /api/usuarios/login', () => {
    it('Si faltan datos debe retornar error 400', async () => {
      const response = await request(app)
        .post('/api/usuarios/login')
        .send({ correo: 'correotest@utalca.cl' }); // Enviamos solo el correo, pero falta la contraseña

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        mensaje: 'Correo y contraseña son obligatorios',
      });
    });

    it('Si el usuario no existe debe retornar error 401', async () => {
      const response = await request(app).post('/api/usuarios/login').send({
        correo: 'correonoexistente@utalca.cl',
        contrasena: 'Password123!',
      });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        mensaje: 'Correo o contraseña incorrectos',
      });
    });

    it('Si el login es exitoso debe retornar 200 y el token', async () => {
      const usuarioSimulado = {
        id: 1,
        nombre: 'Juan',
        apellido: 'Perez',
        correo: 'juan.perez@alumnos.utalca.cl',
        passUsuario: 'Password123!',
        usuarioRol: 'ESTUDIANTE',
      };

      mockPrisma.usuario.findUnique.mockResolvedValue(usuarioSimulado);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('token-falso-prueba');

      const response = await request(app).post('/api/usuarios/login').send({
        correo: 'juan.perez@alumnos.utalca.cl',
        contrasena: 'Password123!',
      });

      expect(response.status).toBe(200);
      expect(response.body.mensaje).toBe('Login exitoso');
      expect(response.body.resultadoLogin.token).toBe('token-falso-prueba');
      expect(response.body.resultadoLogin.usuario.nombre).toBe('Juan');
    });
  });
});

describe('POST /api/usuarios/registro', () => {
  it('Debería retornar 400 si faltan datos obligatorios', async () => {
    // Se simula la peticion pero con datos faltantes
    const response = await request(app).post('/api/usuarios/registro').send({
      nombre: 'Carlos',
      apellido: 'Soto',
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('mensaje');
  });

  it('Si el correo ya existe en la base de datos debe retornar error 400', async () => {
    mockPrisma.usuario.findUnique.mockResolvedValue({
      id: 1,
      correo: 'existe@utalca.cl',
    });

    const response = await request(app).post('/api/usuarios/registro').send({
      rut: '12345678-9',
      nombre: 'Pedro',
      apellido: 'Gomez',
      correo: 'existe@utalca.cl',
      contrasena: 'Clave123',
      rol: 'ESTUDIANTE',
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      mensaje: 'El correo ya está registrado',
    });
  });

  it('Si todo el flujo es correcto debe retornar 202 y registrar al usuario', async () => {
    // Simulamos que el correo no existe en la base de datos
    mockPrisma.usuario.findUnique.mockResolvedValue(null);
    // Simulamos la creación del usuario en la base de datos
    mockPrisma.usuario.create.mockResolvedValue({
      rut: '19876543-2',
      nombre: 'Bryan',
      apellido: 'Ahumada',
      correo: 'bryan@utalca.cl',
      passUsuario: 'hash_generado',
      usuarioRol: 'ESTUDIANTE',
    });

    // envio de la perticion con datos validos para el registro
    const response = await request(app).post('/api/usuarios/registro').send({
      rut: '19876543-2',
      nombre: 'Bryan',
      apellido: 'Ahumada',
      correo: 'bryan@utalca.cl',
      contrasena: 'MiClaveSegura123',
      rol: 'ESTUDIANTE',
    });

    expect(response.status).toBe(202);
    expect(response.body.mensaje).toBe('Usuario registrado exitosamente');
    expect(response.body.usuario.email).toBe('bryan@utalca.cl');
    expect(response.body.usuario.nombre).toBe('Bryan');
  });
});

describe('GET /api/usuarios/', () => {
  it('Si no se envia el token debe retornar error 401', async () => {
    // Se realiza la peticion sin el auth
    const response = await request(app).get('/api/usuarios/');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('mensaje');
  });

  it('Cuando el usuario logeado no es ADMINISTRADOR debe retornar error 401', async () => {
    // Simulamos que el token es válido pero pertenece a un estudiante
    jwt.verify.mockReturnValue({ id: 2, rol: 'ESTUDIANTE' });

    const response = await request(app)
      .get('/api/usuarios/')
      .set('Authorization', 'Bearer token_simulado_estudiante');

    expect(response.status).toBe(401);
    expect(response.body.mensaje).toBe(
      'El usuario no tiene los permisos necesarios'
    );
  });

  it('Si el usuario logeado es ADMINISTRADOR debe retornar 200 y la lista de usuarios', async () => {
    // Simulamos un token valido de ADMINISTRADOR
    jwt.verify.mockReturnValue({ id: 1, rol: 'ADMINISTRADOR' });

    // Simulamos la respuesta de la base de datos
    mockPrisma.usuario.findMany.mockResolvedValue([
      {
        rut: '111',
        nombre: 'Admin',
        apellido: 'Test',
        correo: 'admin@utalca.cl',
        usuarioRol: 'ADMINISTRADOR',
      },
      {
        rut: '222',
        nombre: 'Bryan',
        apellido: 'Ahumada',
        correo: 'bryan@utalca.cl',
        usuarioRol: 'ESTUDIANTE',
      },
    ]);

    const response = await request(app)
      .get('/api/usuarios/')
      .set('Authorization', 'Bearer token_simulado_admin');

    expect(response.status).toBe(200);
    expect(response.body.mensaje).toBe('Lista de usuarios obtenida con exito');
    expect(response.body.usuarios).toHaveLength(2);
  });
});

describe('DELETE /api/usuarios/eliminar/:correo', () => {
  it('Si se intenta eliminar un usuario que no existe debe retornar error 401', async () => {
    jwt.verify.mockReturnValue({ id: 1, rol: 'ADMINISTRADOR' });
    // Simulamos que Prisma no encuentra al usuario
    mockPrisma.usuario.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .delete('/api/usuarios/eliminar/noexiste@utalca.cl')
      .set('Authorization', 'Bearer token_simulado_admin');

    expect(response.status).toBe(401);
    expect(response.body.mensaje).toBe(
      'El correo no existe en la base de datos'
    );
  });

  it('Si se intenta eliminar un usuario que existe debe retornar 200 y borrar al usuario exitosamente', async () => {
    jwt.verify.mockReturnValue({ id: 1, rol: 'ADMINISTRADOR' });

    // Simulamos que Prisma sí encuentra al usuario
    mockPrisma.usuario.findUnique.mockResolvedValue({
      id: 3,
      correo: 'borrar@utalca.cl',
    });
    // Simulamos la respuesta de Prisma al hacer el delete
    mockPrisma.usuario.delete.mockResolvedValue({
      correo: 'borrar@utalca.cl',
      usuarioRol: 'ESTUDIANTE',
    });

    const response = await request(app)
      .delete('/api/usuarios/eliminar/borrar@utalca.cl')
      .set('Authorization', 'Bearer token_simulado_admin');

    expect(response.status).toBe(200);
    expect(response.body.mensaje).toBe('Usuario borrado con exito');
    expect(response.body.usuario.correo).toBe('borrar@utalca.cl');
  });
});
