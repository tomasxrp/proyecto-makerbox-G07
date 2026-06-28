const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const app = require('../../src/index');

const prisma = new PrismaClient();

beforeAll(() => {
  const url = process.env.DATABASE_URL || '';
  if (url.includes('supabase') || !url.includes('localhost')) {
    throw new Error(
      'TESTS DE INTEGRACION DETENIDOS por intentar correrlos en la DB real.'
    );
  }
});

describe('Integración REAL: API Usuarios', () => {
  // Limpiar la BD antes de cada test para evitar conflictos
  beforeEach(async () => {
    await prisma.usuario.deleteMany();
  });

  // Cerrar conexión al final
  afterAll(async () => {
    const url = process.env.DATABASE_URL || '';
    if (!url.includes('supabase') && url.includes('localhost')) {
      await prisma.usuario.deleteMany();
    }
    await prisma.$disconnect();
  });

  describe('POST /api/usuarios/login', () => {
    it('Si faltan datos debe retornar error 400', async () => {
      const response = await request(app)
        .post('/api/usuarios/login')
        .send({ correo: 'correotest@utalca.cl' });

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
      await request(app).post('/api/usuarios/registro').send({
        rut: '12345678-9',
        nombre: 'Juan',
        apellido: 'Perez',
        correo: 'juan.perez@alumnos.utalca.cl',
        contrasena: 'Password123!',
        rol: 'ESTUDIANTE',
      });

      const response = await request(app).post('/api/usuarios/login').send({
        correo: 'juan.perez@alumnos.utalca.cl',
        contrasena: 'Password123!',
      });

      expect(response.status).toBe(200);
      expect(response.body.mensaje).toBe('Login exitoso');
      expect(response.body.resultadoLogin.token).toBeDefined();
      expect(response.body.resultadoLogin.usuario.nombre).toBe('Juan');
    });
  });

  describe('POST /api/usuarios/registro', () => {
    it('Debería retornar 400 si faltan datos obligatorios', async () => {
      const response = await request(app).post('/api/usuarios/registro').send({
        nombre: 'Carlos',
        apellido: 'Soto',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('mensaje');
    });

    it('Si el correo ya existe debe retornar error 400', async () => {
      await request(app).post('/api/usuarios/registro').send({
        rut: '11111111-1',
        nombre: 'Pedro',
        apellido: 'Gomez',
        correo: 'existe@utalca.cl',
        contrasena: 'Clave123',
        rol: 'ESTUDIANTE',
      });

      const response = await request(app).post('/api/usuarios/registro').send({
        rut: '22222222-2',
        nombre: 'Otro',
        apellido: 'Usuario',
        correo: 'existe@utalca.cl',
        contrasena: 'Clave123',
        rol: 'ESTUDIANTE',
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        mensaje: 'El correo ya está registrado',
      });
    });

    it('Si todo el flujo es correcto debe retornar 202', async () => {
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

      const usuarioEnBD = await prisma.usuario.findUnique({
        where: { correo: 'bryan@utalca.cl' },
      });
      expect(usuarioEnBD).not.toBeNull();
      expect(usuarioEnBD.nombre).toBe('Bryan');
    });
  });

  describe('GET /api/usuarios/', () => {
    it('Si no se envía token debe retornar 401', async () => {
      const response = await request(app).get('/api/usuarios/');
      expect(response.status).toBe(401);
    });

    it('Si el usuario es ADMINISTRADOR debe retornar 200', async () => {
      // Registrar admin directamente en la BD porque la API no permite rol ADMINISTRADOR
      // eslint-disable-next-line
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const contrasenaEncriptada = await bcrypt.hash('AdminPass123', salt);

      await prisma.usuario.create({
        data: {
          rut: '99999999-9',
          nombre: 'Admin',
          apellido: 'Test',
          correo: 'admin@utalca.cl',
          passUsuario: contrasenaEncriptada,
          usuarioRol: 'ADMINISTRADOR',
        },
      });

      // Login para obtener token REAL
      const loginRes = await request(app).post('/api/usuarios/login').send({
        correo: 'admin@utalca.cl',
        contrasena: 'AdminPass123',
      });

      const tokenReal = loginRes.body.resultadoLogin.token;

      // Usar ese token REAL
      const response = await request(app)
        .get('/api/usuarios/')
        .set('Authorization', `Bearer ${tokenReal}`);

      expect(response.status).toBe(200);
      expect(response.body.mensaje).toBe(
        'Lista de usuarios obtenida con exito'
      );
      expect(response.body.usuarios.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('DELETE /api/usuarios/eliminar/:correo', () => {
    it('Si intentamos eliminar un usuario que no existe debe retornar 401', async () => {
      // eslint-disable-next-line
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const contrasenaEncriptada = await bcrypt.hash('AdminPass123', salt);

      await prisma.usuario.create({
        data: {
          rut: '99999999-9',
          nombre: 'Admin',
          apellido: 'Test',
          correo: 'admin@utalca.cl',
          passUsuario: contrasenaEncriptada,
          usuarioRol: 'ADMINISTRADOR',
        },
      });

      const loginRes = await request(app).post('/api/usuarios/login').send({
        correo: 'admin@utalca.cl',
        contrasena: 'AdminPass123',
      });
      const tokenReal = loginRes.body.resultadoLogin.token;

      const response = await request(app)
        .delete('/api/usuarios/eliminar/noexiste@utalca.cl')
        .set('Authorization', `Bearer ${tokenReal}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('mensaje');
    });

    it('Si todo es correcto debe retornar 200 y eliminar al usuario', async () => {
      // eslint-disable-next-line
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const contrasenaEncriptada = await bcrypt.hash('AdminPass123', salt);

      await prisma.usuario.create({
        data: {
          rut: '88888888-8',
          nombre: 'Admin2',
          apellido: 'Test2',
          correo: 'admin2@utalca.cl',
          passUsuario: contrasenaEncriptada,
          usuarioRol: 'ADMINISTRADOR',
        },
      });

      await request(app).post('/api/usuarios/registro').send({
        rut: '33333333-3',
        nombre: 'Para',
        apellido: 'Borrar',
        correo: 'paraborrar@utalca.cl',
        contrasena: 'Clave123',
        rol: 'ESTUDIANTE',
      });

      const loginRes = await request(app).post('/api/usuarios/login').send({
        correo: 'admin2@utalca.cl',
        contrasena: 'AdminPass123',
      });
      const tokenReal = loginRes.body.resultadoLogin.token;

      const response = await request(app)
        .delete('/api/usuarios/eliminar/paraborrar@utalca.cl')
        .set('Authorization', `Bearer ${tokenReal}`);

      expect(response.status).toBe(200);
      expect(response.body.mensaje).toBe('Usuario borrado con exito');
    });
  });
});
