const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const rolesPermitidos = [
  'ADMINISTRADOR',
  'PROFESOR',
  'AYUDANTE',
  'ESTUDIANTE',
  'SOLICITANTE',
];

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

const crearUsuario = async (usuarioCreador, datosUsuario) => {
  if (!rolesPermitidos.includes(datosUsuario.rol)) {
    throw new Error('El rol no es valido');
  }

  const usuarioExistente = await prisma.usuario.findUnique({
    where: {
      correo: datosUsuario.correo,
    },
  });

  if (usuarioExistente) {
    throw new Error('El correo ya está registrado');
  }

  if (usuarioCreador.rol === 'PROFESOR' && datosUsuario.rol !== 'AYUDANTE') {
    throw new Error('El profesor solo puede crear ayudantes');
  }

  if (
    usuarioCreador.rol !== 'ADMINISTRADOR' &&
    usuarioCreador.rol !== 'PROFESOR'
  ) {
    throw new Error('El usuario no tiene permisos para crear usuarios');
  }

  const salt = await bcrypt.genSalt(10);
  const contrasenaEncriptada = await bcrypt.hash(datosUsuario.contrasena, salt);

  const nuevoUsuario = await prisma.usuario.create({
    data: {
      rut: datosUsuario.rut,
      nombre: datosUsuario.nombre,
      apellido: datosUsuario.apellido,
      correo: datosUsuario.correo,
      passUsuario: contrasenaEncriptada,
      usuarioRol: datosUsuario.rol,
    },
  });

  return {
    rut: nuevoUsuario.rut,
    nombre: nuevoUsuario.nombre,
    apellido: nuevoUsuario.apellido,
    email: nuevoUsuario.correo,
    rol: nuevoUsuario.usuarioRol,
  };
};

const actualizarUsuario = async (
  usuarioCreador,
  correoAnterior,
  datosUsuario
) => {
  if (usuarioCreador.rol !== 'ADMINISTRADOR') {
    throw new Error('El usuario no tiene permisos para actualizar usuarios');
  }

  const usuarioEncontrado = await prisma.usuario.findUnique({
    where: {
      correo: correoAnterior,
    },
  });

  if (!usuarioEncontrado) {
    throw new Error('El correo no existe en la base de datos');
  }

  if (datosUsuario.correo && datosUsuario.correo !== correoAnterior) {
    const correoRepetido = await prisma.usuario.findUnique({
      where: {
        correo: datosUsuario.correo,
      },
    });

    if (correoRepetido) {
      throw new Error('El nuevo correo ya está registrado');
    }
  }

  if (datosUsuario.rol && !rolesPermitidos.includes(datosUsuario.rol)) {
    throw new Error('El rol no es valido');
  }

  const dataActualizacion = {
    rut: datosUsuario.rut || usuarioEncontrado.rut,
    nombre: datosUsuario.nombre || usuarioEncontrado.nombre,
    apellido: datosUsuario.apellido || usuarioEncontrado.apellido,
    correo: datosUsuario.correo || usuarioEncontrado.correo,
    usuarioRol: datosUsuario.rol || usuarioEncontrado.usuarioRol,
  };

  if (datosUsuario.contrasena) {
    const salt = await bcrypt.genSalt(10);
    dataActualizacion.passUsuario = await bcrypt.hash(
      datosUsuario.contrasena,
      salt
    );
  }

  const usuarioActualizado = await prisma.usuario.update({
    where: {
      correo: correoAnterior,
    },
    data: dataActualizacion,
  });

  return {
    rut: usuarioActualizado.rut,
    nombre: usuarioActualizado.nombre,
    apellido: usuarioActualizado.apellido,
    email: usuarioActualizado.correo,
    rol: usuarioActualizado.usuarioRol,
  };
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

const eliminarUsuario = async (usuario, correoEliminar) => {
  if (usuario.rol !== 'ADMINISTRADOR') {
    throw new Error('El usuario no tiene los permisos necesarios');
  }

  const usuarioEncontrado = await prisma.usuario.findUnique({
    where: {
      correo: correoEliminar,
    },
  });

  if (!usuarioEncontrado) {
    throw new Error('El correo no existe en la base de datos');
  }

  const usuarioEliminar = await prisma.usuario.delete({
    where: {
      correo: correoEliminar,
    },
  });

  return {
    correo: usuarioEliminar.correo,
    rol: usuarioEliminar.usuarioRol, // Asegúrate de que tu BD devuelva usuarioRol
  };
};

const obtenerUsuarioPorCorreo = async (correo, usuario) => {
  if (usuario.rol !== 'ADMINISTRADOR') {
    throw new Error('El usuario no tiene los permisos necesarios');
  }

  const usuarioEncontrado = await prisma.usuario.findUnique({
    where: {
      correo,
    },
  });

  if (!usuarioEncontrado) {
    throw new Error('El correo no existe en la base de datos');
  }

  return {
    rut: usuarioEncontrado.rut,
    nombre: usuarioEncontrado.nombre,
    apellido: usuarioEncontrado.apellido,
    correo: usuarioEncontrado.correo,
    rol: usuarioEncontrado.usuarioRol,
  };
};

const ObtenerListaUsuarios = async (usuario) => {
  if (usuario.rol !== 'ADMINISTRADOR') {
    throw new Error('El usuario no tiene los permisos necesarios');
  }

  const listaUsuarios = await prisma.usuario.findMany({
    select: {
      rut: true,
      nombre: true,
      apellido: true,
      correo: true,
      usuarioRol: true,
    },
  });

  return listaUsuarios;
};

module.exports = {
  registrarUsuario,
  crearUsuario,
  actualizarUsuario,
  loginUsuario,
  eliminarUsuario,
  obtenerUsuarioPorCorreo,
  ObtenerListaUsuarios,
};
