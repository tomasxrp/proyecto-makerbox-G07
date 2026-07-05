const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const tienePermisoGestionCurso = (usuario) => {
  const rolUsuario = usuario.usuarioRol || usuario.rol;

  return (
    rolUsuario === 'ADMINISTRADOR' ||
    rolUsuario === 'AYUDANTE' ||
    rolUsuario === 'PROFESOR'
  );
};

const obtenerRolUsuario = (usuario) => usuario.usuarioRol || usuario.rol;

const validarProfesorPropietarioDelCurso = async (usuario, cursoId) => {
  const rolUsuario = obtenerRolUsuario(usuario);

  const curso = await prisma.curso.findUnique({
    where: {
      id: cursoId,
    },
    include: {
      semestre: true,
      profesor: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          correo: true,
        },
      },
    },
  });

  if (!curso) {
    throw new Error('El curso no existe en la base de datos');
  }

  if (
    rolUsuario !== 'ADMINISTRADOR' &&
    !(rolUsuario === 'PROFESOR' && curso.refProfesor === usuario.id)
  ) {
    throw new Error('No tienes permisos para gestionar este curso');
  }

  return curso;
};

const crearCurso = async (usuario, nombre, refSemestre, refProfesor) => {
  const rolUsuario = usuario.usuarioRol || usuario.rol;

  if (rolUsuario !== 'ADMINISTRADOR' && rolUsuario !== 'PROFESOR') {
    throw new Error('Solo administrador o profesor pueden crear cursos');
  }

  if (!nombre || !refSemestre) {
    throw new Error('Nombre y semestre son obligatorios');
  }

  const semestreEncontrado = await prisma.semestre.findUnique({
    where: {
      id: refSemestre,
    },
  });

  if (!semestreEncontrado) {
    throw new Error('El semestre no existe en la base de datos');
  }

  const profesorId = rolUsuario === 'PROFESOR' ? usuario.id : refProfesor;

  if (!profesorId) {
    throw new Error('Debes indicar el profesor para el curso');
  }

  if (rolUsuario === 'PROFESOR' && refProfesor && refProfesor !== usuario.id) {
    throw new Error('Un profesor solo puede crear cursos para sí mismo');
  }

  const profesorEncontrado = await prisma.usuario.findUnique({
    where: {
      id: profesorId,
    },
  });

  if (!profesorEncontrado || profesorEncontrado.usuarioRol !== 'PROFESOR') {
    throw new Error('El profesor no existe o no tiene rol PROFESOR');
  }

  const nuevoCurso = await prisma.curso.create({
    data: {
      nombre,
      refSemestre,
      refProfesor: profesorId,
    },
  });

  return nuevoCurso;
};

const obtenerCursos = async () => {
  const cursos = await prisma.curso.findMany({
    include: {
      semestre: true,
      profesor: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          correo: true,
        },
      },
      impresions: {
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
      },
    },
    orderBy: {
      creadoEn: 'desc',
    },
  });

  return cursos;
};

const obtenerCursoPorId = async (cursoId) => {
  const cursoEncontrado = await prisma.curso.findUnique({
    where: {
      id: cursoId,
    },
    include: {
      semestre: true,
      profesor: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          correo: true,
        },
      },
      cursoAyudantes: {
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              correo: true,
              rut: true,
              usuarioRol: true,
            },
          },
        },
      },
    },
  });

  if (!cursoEncontrado) {
    throw new Error('El curso no existe en la base de datos');
  }

  return cursoEncontrado;
};

const obtenerCursosDisponibles = async (usuario) => {
  const rolUsuario = obtenerRolUsuario(usuario);

  if (rolUsuario !== 'ESTUDIANTE') {
    throw new Error('Solo un estudiante puede consultar cursos disponibles');
  }

  const cursosInscritos = await prisma.estudianteCurso.findMany({
    where: {
      refEstudiante: usuario.id,
    },
    select: {
      refCurso: true,
    },
  });

  const idsCursosInscritos = cursosInscritos.map((item) => item.refCurso);

  return prisma.curso.findMany({
    where: {
      ...(idsCursosInscritos.length
        ? {
            id: {
              notIn: idsCursosInscritos,
            },
          }
        : {}),
    },
    include: {
      semestre: true,
      profesor: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          correo: true,
        },
      },
    },
    orderBy: {
      creadoEn: 'desc',
    },
  });
};

const obtenerMisCursos = async (usuario) => {
  const rolUsuario = obtenerRolUsuario(usuario);

  if (rolUsuario !== 'ESTUDIANTE') {
    throw new Error('Solo un estudiante puede consultar sus cursos');
  }

  const cursosInscritos = await prisma.estudianteCurso.findMany({
    where: {
      refEstudiante: usuario.id,
    },
    include: {
      curso: {
        include: {
          semestre: true,
          profesor: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              correo: true,
            },
          },
        },
      },
    },
    orderBy: {
      curso: {
        creadoEn: 'desc',
      },
    },
  });

  return cursosInscritos.map((registro) => registro.curso);
};

const inscribirEnCurso = async (usuario, cursoId) => {
  const rolUsuario = obtenerRolUsuario(usuario);

  if (rolUsuario !== 'ESTUDIANTE') {
    throw new Error('Solo un estudiante puede inscribirse a cursos');
  }

  const curso = await prisma.curso.findUnique({
    where: {
      id: cursoId,
    },
  });

  if (!curso) {
    throw new Error('El curso no existe en la base de datos');
  }

  const inscripcionExistente = await prisma.estudianteCurso.findUnique({
    where: {
      refCurso_refEstudiante: {
        refCurso: cursoId,
        refEstudiante: usuario.id,
      },
    },
  });

  if (inscripcionExistente) {
    throw new Error('Ya estás inscrito en este curso');
  }

  return prisma.estudianteCurso.create({
    data: {
      refCurso: cursoId,
      refEstudiante: usuario.id,
    },
    include: {
      curso: true,
    },
  });
};

const obtenerAyudantesCurso = async (usuario, cursoId) => {
  await validarProfesorPropietarioDelCurso(usuario, cursoId);

  const ayudantes = await prisma.cursoAyudante.findMany({
    where: {
      refCurso: cursoId,
    },
    include: {
      usuario: {
        select: {
          id: true,
          rut: true,
          nombre: true,
          apellido: true,
          correo: true,
          usuarioRol: true,
        },
      },
    },
    orderBy: {
      creadoEn: 'desc',
    },
  });

  return ayudantes;
};

const asignarAyudanteCurso = async (usuario, cursoId, usuarioId) => {
  await validarProfesorPropietarioDelCurso(usuario, cursoId);

  const usuarioAyudante = await prisma.usuario.findUnique({
    where: {
      id: usuarioId,
    },
    select: {
      id: true,
      rut: true,
      nombre: true,
      apellido: true,
      correo: true,
      usuarioRol: true,
    },
  });

  if (!usuarioAyudante) {
    throw new Error('El usuario seleccionado no existe');
  }

  if (
    usuarioAyudante.usuarioRol !== 'ESTUDIANTE' &&
    usuarioAyudante.usuarioRol !== 'AYUDANTE'
  ) {
    throw new Error('Solo se pueden asignar usuarios ESTUDIANTE o AYUDANTE');
  }

  try {
    return await prisma.cursoAyudante.create({
      data: {
        refCurso: cursoId,
        refUsuario: usuarioAyudante.id,
      },
      include: {
        usuario: true,
      },
    });
  } catch (error) {
    if (error.code === 'P2002') {
      throw new Error(
        'Ese estudiante ya está asignado como ayudante en este curso'
      );
    }

    throw error;
  }
};

const eliminarAyudanteCurso = async (usuario, cursoId, usuarioId) => {
  await validarProfesorPropietarioDelCurso(usuario, cursoId);

  const relacion = await prisma.cursoAyudante.findUnique({
    where: {
      refCurso_refUsuario: {
        refCurso: cursoId,
        refUsuario: usuarioId,
      },
    },
  });

  if (!relacion) {
    throw new Error('El ayudante no está asignado a este curso');
  }

  return prisma.cursoAyudante.delete({
    where: {
      refCurso_refUsuario: {
        refCurso: cursoId,
        refUsuario: usuarioId,
      },
    },
  });
};

const eliminarCurso = async (usuario, cursoId) => {
  if (!tienePermisoGestionCurso(usuario)) {
    throw new Error('Usuario no tiene los permisos necesarios.');
  }

  const cursoEncontrado = await prisma.curso.findUnique({
    where: {
      id: cursoId,
    },
  });

  if (!cursoEncontrado) {
    throw new Error('El curso no existe en la base de datos');
  }

  const cursoEliminado = await prisma.curso.delete({
    where: {
      id: cursoId,
    },
  });

  return cursoEliminado;
};

const actualizarCurso = async (usuario, cursoId, data) => {
  if (!tienePermisoGestionCurso(usuario)) {
    throw new Error('Usuario no tiene los permisos necesarios.');
  }

  const cursoEncontrado = await prisma.curso.findUnique({
    where: {
      id: cursoId,
    },
  });

  if (!cursoEncontrado) {
    throw new Error('El curso no existe en la base de datos');
  }

  const cursoActualizado = await prisma.curso.update({
    where: {
      id: cursoId,
    },
    data,
  });

  return {
    mensaje: 'Curso actualizado con exito',
    cursoActualizado,
  };
};

module.exports = {
  crearCurso,
  obtenerCursos,
  obtenerCursoPorId,
  obtenerCursosDisponibles,
  obtenerMisCursos,
  inscribirEnCurso,
  obtenerAyudantesCurso,
  asignarAyudanteCurso,
  eliminarAyudanteCurso,
  eliminarCurso,
  actualizarCurso,
};
