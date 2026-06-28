const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const tienePermisoGestionAyudantia = (usuario) => {
  const rolUsuario = usuario.usuarioRol || usuario.rol;

  return (
    rolUsuario === 'ADMINISTRADOR' ||
    rolUsuario === 'AYUDANTE' ||
    rolUsuario === 'PROFESOR'
  );
};

const crearAyudantia = async (
  usuario,
  {
    nombreAyudantia,
    refCurso,
    refGrupo,
    refAyudante,
    horario,
    cupoMaximo,
    estado,
  }
) => {
  if (!tienePermisoGestionAyudantia(usuario)) {
    throw new Error('Usuario no tiene los permisos necesarios.');
  }

  const nuevaAyudantia = await prisma.ayudantia.create({
    data: {
      nombreAyudantia,
      refCurso,
      refGrupo: refGrupo || null,
      refAyudante,
      horario: new Date(horario),
      cupoMaximo,
      estado,
    },
  });

  return nuevaAyudantia;
};

const obtenerAyudantias = async () => {
  const ayudantias = await prisma.ayudantia.findMany({
    include: {
      curso: true,
      ayudante: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          correo: true,
        },
      },
      grupo: true,
    },
  });

  return ayudantias;
};

const obtenerAyudantiaPorId = async (ayudantiaId) => {
  const ayudantiaEncontrada = await prisma.ayudantia.findUnique({
    where: {
      id: ayudantiaId,
    },
    include: {
      curso: true,
      ayudante: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          correo: true,
        },
      },
      grupo: true,
      inscripcionAyudantias: true,
    },
  });

  if (!ayudantiaEncontrada) {
    throw new Error('La ayudantía no existe en la base de datos');
  }

  return ayudantiaEncontrada;
};

const eliminarAyudantia = async (usuario, ayudantiaId) => {
  if (!tienePermisoGestionAyudantia(usuario)) {
    throw new Error('Usuario no tiene los permisos necesarios.');
  }

  const ayudantiaEncontrada = await prisma.ayudantia.findUnique({
    where: {
      id: ayudantiaId,
    },
  });

  if (!ayudantiaEncontrada) {
    throw new Error('La ayudantía no existe en la base de datos');
  }

  const ayudantiaEliminada = await prisma.ayudantia.delete({
    where: {
      id: ayudantiaId,
    },
  });

  return ayudantiaEliminada;
};

const actualizarAyudantia = async (usuario, ayudantiaId, data) => {
  if (!tienePermisoGestionAyudantia(usuario)) {
    throw new Error('Usuario no tiene los permisos necesarios.');
  }

  const ayudantiaEncontrada = await prisma.ayudantia.findUnique({
    where: {
      id: ayudantiaId,
    },
  });

  if (!ayudantiaEncontrada) {
    throw new Error('La ayudantía no existe en la base de datos');
  }

  // Copiamos el objeto para no mutar el parámetro "data" directamente (regla de airbnb)
  const datosAActualizar = { ...data };

  if (datosAActualizar.horario) {
    datosAActualizar.horario = new Date(datosAActualizar.horario);
  }

  const ayudantiaActualizada = await prisma.ayudantia.update({
    where: {
      id: ayudantiaId,
    },
    data: datosAActualizar,
  });

  return {
    mensaje: 'Ayudantía actualizada con éxito',
    ayudantiaActualizada,
  };
};

module.exports = {
  crearAyudantia,
  obtenerAyudantias,
  obtenerAyudantiaPorId,
  eliminarAyudantia,
  actualizarAyudantia,
};
