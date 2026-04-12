const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const registrarUsuario = async (
  rut,
  nombre,
  apellido,
  correo,
  contrasena,
  rol
) => {
  // Verificar si el correo ya existe en la base de datos
  const usuarioExistente = await prisma.usuario.findUnique({
    where: {
      correo,
    },
  });

  if (usuarioExistente) {
    throw new Error('El correo ya está registrado');
  }

  // Encriptar la contrasena
  const salt = await bcrypt.genSalt(10);
  const contrasenaEncriptada = await bcrypt.hash(contrasena, salt);

  // Creacion del usuario en base de datos
  const nuevoUsuario = await prisma.usuario.create({
    data: {
      rut,
      nombre,
      apellido,
      correo,
      passUsuario: contrasenaEncriptada,
      usuarioRol: rol,
    },
  });

  const response = {
    rut: nuevoUsuario.rut,
    nombre: nuevoUsuario.nombre,
    apellido: nuevoUsuario.apellido,
    email: nuevoUsuario.correo,
    rol: nuevoUsuario.usuarioRol,
  };

  return response;
};

const loginUsuario = async (correo, contrasena) => {
  // Verificar si el correo existe en la base de datos
  const usuarioObtenido = await prisma.usuario.findUnique({
    where: {
      correo,
    },
  });
  if (!usuarioObtenido) {
    throw new Error('Correo no registrado');
  }

  // verificar si la contrasena es correcta
  const contrasenaValida = await bcrypt.compare(
    contrasena,
    usuarioObtenido.passUsuario
  );
  if (!contrasenaValida) {
    throw new Error('Contraseña incorrecta');
  }

  const payloadJWT = {
    id: usuarioObtenido.id,
    rol: usuarioObtenido.usuarioRol,
  };

  const token = jwt.sign(payloadJWT, process.env.JWT_SECRET, {
    expiresIn: '24h',
  });

  return {
    token,
    usuario: {
      nombre: usuarioObtenido.nombre,
      apellido: usuarioObtenido.apellido,
      rol: usuarioObtenido.usuarioRol,
    },
  };
};

module.exports = {
  registrarUsuario,
  loginUsuario,
};
