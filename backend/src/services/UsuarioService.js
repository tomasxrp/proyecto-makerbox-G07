const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
  normalizarCorreo,
  validarDominioCorreoPorRol,
} = require('../utils/emailDomainPolicy');

const prisma = new PrismaClient();

const encriptarContrasena = async (contrasena) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(contrasena, salt);
};

const vincularCursosPendientes = async (usuarioCreado) => {
  if (usuarioCreado.usuarioRol !== 'ESTUDIANTE') {
    return;
  }

  const pendientes = await prisma.estudianteCursoPendiente.findMany({
    where: {
      OR: [{ correo: usuarioCreado.correo }, { rut: usuarioCreado.rut }],
    },
  });

  if (pendientes.length === 0) {
    return;
  }

  await Promise.all(
    pendientes.map((pendiente) =>
      prisma.estudianteCurso.upsert({
        where: {
          refCurso_refEstudiante: {
            refCurso: pendiente.refCurso,
            refEstudiante: usuarioCreado.id,
          },
        },
        update: {},
        create: {
          refCurso: pendiente.refCurso,
          refEstudiante: usuarioCreado.id,
        },
      })
    )
  );

  await prisma.estudianteCursoPendiente.deleteMany({
    where: {
      OR: [{ correo: usuarioCreado.correo }, { rut: usuarioCreado.rut }],
    },
  });
};

const registrarUsuario = async (
  rut,
  nombre,
  apellido,
  correo,
  contrasena,
  rol
) => {
  const correoNormalizado = normalizarCorreo(correo);
  const validacionDominio = validarDominioCorreoPorRol(correoNormalizado, rol);

  if (!validacionDominio.esValido) {
    throw new Error(validacionDominio.mensaje);
  }

  // Verificar si el correo ya existe en la base de datos
  const usuarioExistente = await prisma.usuario.findUnique({
    where: {
      correo: correoNormalizado,
    },
  });

  if (usuarioExistente) {
    throw new Error('El correo ya está registrado');
  }

  // Encriptar la contrasena
  const contrasenaEncriptada = await encriptarContrasena(contrasena);

  // Creacion del usuario en base de datos
  const nuevoUsuario = await prisma.usuario.create({
    data: {
      rut,
      nombre,
      apellido,
      correo: correoNormalizado,
      passUsuario: contrasenaEncriptada,
      usuarioRol: rol,
    },
  });

  await vincularCursosPendientes(nuevoUsuario);

  const response = {
    rut: nuevoUsuario.rut,
    nombre: nuevoUsuario.nombre,
    apellido: nuevoUsuario.apellido,
    email: nuevoUsuario.correo,
    rol: nuevoUsuario.usuarioRol,
  };

  return response;
};

const crearUsuarioInterno = async (
  usuario,
  rut,
  nombre,
  apellido,
  correo,
  contrasena,
  rol
) => {
  if (usuario.rol !== 'ADMINISTRADOR') {
    throw new Error('Solo un administrador puede crear usuarios internos');
  }

  const rolesPermitidos = ['PROFESOR', 'AYUDANTE'];

  if (!rolesPermitidos.includes(rol)) {
    throw new Error('El admin solo puede crear PROFESOR o AYUDANTE');
  }

  const correoNormalizado = normalizarCorreo(correo);
  const validacionDominio = validarDominioCorreoPorRol(correoNormalizado, rol);

  if (!validacionDominio.esValido) {
    throw new Error(validacionDominio.mensaje);
  }

  const usuarioExistente = await prisma.usuario.findFirst({
    where: {
      OR: [{ correo: correoNormalizado }, { rut }],
    },
  });

  if (usuarioExistente) {
    throw new Error('El correo o rut ya está registrado');
  }

  const contrasenaEncriptada = await encriptarContrasena(contrasena);

  const nuevoUsuario = await prisma.usuario.create({
    data: {
      rut,
      nombre,
      apellido,
      correo: correoNormalizado,
      passUsuario: contrasenaEncriptada,
      usuarioRol: rol,
    },
  });

  return {
    id: nuevoUsuario.id,
    rut: nuevoUsuario.rut,
    nombre: nuevoUsuario.nombre,
    apellido: nuevoUsuario.apellido,
    correo: nuevoUsuario.correo,
    rol: nuevoUsuario.usuarioRol,
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
    throw new Error('Correo o contraseña incorrectos');
  }

  // verificar si la contrasena es correcta
  const contrasenaValida = await bcrypt.compare(
    contrasena,
    usuarioObtenido.passUsuario
  );
  if (!contrasenaValida) {
    throw new Error('Correo o contraseña incorrectos');
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
      id: usuarioObtenido.id,
      nombre: usuarioObtenido.nombre,
      apellido: usuarioObtenido.apellido,
      rol: usuarioObtenido.usuarioRol,
    },
  };
};

const eliminarUsuario = async (usuario, correoEliminar) => {
  if (
    usuario.rol !== 'ADMINISTRADOR' &&
    usuario.rol !== 'AYUDANTE' &&
    usuario.rol !== 'PROFESOR'
  ) {
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
  if (
    usuario.rol !== 'ADMINISTRADOR' &&
    usuario.rol !== 'AYUDANTE' &&
    usuario.rol !== 'PROFESOR'
  ) {
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
  if (
    usuario.rol !== 'ADMINISTRADOR' &&
    usuario.rol !== 'AYUDANTE' &&
    usuario.rol !== 'PROFESOR'
  ) {
    throw new Error('El usuario no tiene los permisos necesarios');
  }

  const listaUsuarios = await prisma.usuario.findMany({
    select: {
      id: true,
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
  crearUsuarioInterno,
  loginUsuario,
  eliminarUsuario,
  obtenerUsuarioPorCorreo,
  ObtenerListaUsuarios,
};
