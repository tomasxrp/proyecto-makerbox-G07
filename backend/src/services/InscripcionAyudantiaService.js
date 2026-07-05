const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const tienePermisoGestionAsistencia = (usuario) => {
  const rolUsuario = usuario.usuarioRol || usuario.rol;
  return (
    rolUsuario === 'ADMINISTRADOR' ||
    rolUsuario === 'AYUDANTE' ||
    rolUsuario === 'PROFESOR'
  );
};

const crearInscripcionAyudantia = async (
  usuario,
  { refAyudantia, refEstudiante, estado }
) => {
  const rolUsuario = usuario.usuarioRol || usuario.rol;
  if (rolUsuario === 'ESTUDIANTE' && usuario.id !== refEstudiante) {
    throw new Error('Un estudiante solo puede inscribirse a sí mismo.');
  }

  const nuevaInscripcion = await prisma.inscripcionAyudantia.create({
    data: {
      refAyudantia,
      refEstudiante,
      estado: estado || 'ASISTIO',
    },
  });

  return nuevaInscripcion;
};

const obtenerInscripcionesAyudantias = async () => {
  const inscripciones = await prisma.inscripcionAyudantia.findMany({
    include: {
      ayudantia: true,
      estudiante: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          correo: true,
        },
      },
    },
  });

  return inscripciones;
};

const obtenerInscripcionPorId = async (refAyudantia, refEstudiante) => {
  const inscripcionEncontrada = await prisma.inscripcionAyudantia.findUnique({
    where: {
      refAyudantia_refEstudiante: {
        refAyudantia,
        refEstudiante,
      },
    },
    include: {
      ayudantia: true,
      estudiante: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          correo: true,
        },
      },
    },
  });

  if (!inscripcionEncontrada) {
    throw new Error('La inscripción no existe en la base de datos');
  }

  return inscripcionEncontrada;
};

const obtenerInscripcionesPorAyudantia = async (refAyudantia) => {
  const inscripciones = await prisma.inscripcionAyudantia.findMany({
    where: {
      refAyudantia,
    },
    include: {
      estudiante: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          correo: true,
        },
      },
    },
  });

  return inscripciones;
};

const actualizarInscripcionAyudantia = async (
  usuario,
  refAyudantia,
  refEstudiante,
  data
) => {
  if (!tienePermisoGestionAsistencia(usuario)) {
    throw new Error(
      'Usuario no tiene los permisos necesarios para modificar la asistencia.'
    );
  }

  const inscripcionEncontrada = await prisma.inscripcionAyudantia.findUnique({
    where: {
      refAyudantia_refEstudiante: {
        refAyudantia,
        refEstudiante,
      },
    },
  });

  if (!inscripcionEncontrada) {
    throw new Error('La inscripción no existe en la base de datos');
  }

  const datosAActualizar = { ...data };

  const inscripcionActualizada = await prisma.inscripcionAyudantia.update({
    where: {
      refAyudantia_refEstudiante: {
        refAyudantia,
        refEstudiante,
      },
    },
    data: datosAActualizar,
  });

  return {
    mensaje: 'Inscripción actualizada con éxito',
    inscripcionActualizada,
  };
};

const eliminarInscripcionAyudantia = async (
  usuario,
  refAyudantia,
  refEstudiante
) => {
  const rolUsuario = usuario.usuarioRol || usuario.rol;
  // Un estudiante puede eliminar su propia inscripción, o un admin/ayudante puede hacerlo
  if (rolUsuario === 'ESTUDIANTE' && usuario.id !== refEstudiante) {
    throw new Error('No tienes permiso para eliminar esta inscripción.');
  }

  const inscripcionEncontrada = await prisma.inscripcionAyudantia.findUnique({
    where: {
      refAyudantia_refEstudiante: {
        refAyudantia,
        refEstudiante,
      },
    },
  });

  if (!inscripcionEncontrada) {
    throw new Error('La inscripción no existe en la base de datos');
  }

  const inscripcionEliminada = await prisma.inscripcionAyudantia.delete({
    where: {
      refAyudantia_refEstudiante: {
        refAyudantia,
        refEstudiante,
      },
    },
  });

  return inscripcionEliminada;
};

module.exports = {
  crearInscripcionAyudantia,
  obtenerInscripcionesAyudantias,
  obtenerInscripcionPorId,
  obtenerInscripcionesPorAyudantia,
  actualizarInscripcionAyudantia,
  eliminarInscripcionAyudantia,
};
