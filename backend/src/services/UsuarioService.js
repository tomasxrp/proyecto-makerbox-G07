const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

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

module.exports = {
  registrarUsuario,
};
