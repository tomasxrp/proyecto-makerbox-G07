const { PrismaClient } = require('@prisma/client');
const { parse } = require('csv-parse');

const prisma = new PrismaClient();

const tienePermiso = (usuario) => {
  const rolUsuario = usuario.rol || usuario.usuarioRol;

  return (
    rolUsuario === 'ADMINISTRADOR' ||
    rolUsuario === 'PROFESOR' ||
    rolUsuario === 'AYUDANTE'
  );
};

const asignarEstudianteACurso = async (usuario, refCurso, refEstudiante) => {
  if (!tienePermiso(usuario)) {
    throw new Error('Usuario no tiene los permisos necesarios.');
  }

  const nuevaAsignacion = await prisma.estudianteCurso.create({
    data: {
      refCurso,
      refEstudiante,
    },
  });

  return nuevaAsignacion;
};

const cargarEstudiantesDesdeCsv = async (usuario, refCurso, archivoBuffer) => {
  if (!tienePermiso(usuario)) {
    throw new Error('Usuario no tiene los permisos necesarios.');
  }

  const registros = await new Promise((resolve, reject) => {
    parse(
      archivoBuffer,
      {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
      },
      (error, output) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(output);
      }
    );
  });

  const resultado = {
    asignados: [],
    noEncontrados: [],
    yaAsignados: [],
  };

  const procesos = registros.map(async (registro) => {
    const correo =
      registro.correo ||
      registro.email ||
      registro['Dirección de correo'] ||
      registro['Direccion de correo'];

    if (!correo) {
      return {
        tipo: 'noEncontrados',
        datos: {
          fila: registro,
          motivo: 'Correo no encontrado en la fila',
        },
      };
    }

    const estudiante = await prisma.usuario.findUnique({
      where: {
        correo,
      },
    });

    if (estudiante && estudiante.usuarioRol !== 'ESTUDIANTE') {
      return {
        tipo: 'noEncontrados',
        datos: {
          correo,
          motivo: 'El usuario existe, pero no tiene rol ESTUDIANTE',
        },
      };
    }

    if (!estudiante) {
      return {
        tipo: 'noEncontrados',
        datos: {
          correo,
          motivo: 'Estudiante no existe en el sistema',
        },
      };
    }

    const asignacionExistente = await prisma.estudianteCurso.findUnique({
      where: {
        refCurso_refEstudiante: {
          refCurso,
          refEstudiante: estudiante.id,
        },
      },
    });

    if (asignacionExistente) {
      return {
        tipo: 'yaAsignados',
        datos: {
          correo,
          nombre: estudiante.nombre,
          apellido: estudiante.apellido,
        },
      };
    }

    const asignacion = await prisma.estudianteCurso.create({
      data: {
        refCurso,
        refEstudiante: estudiante.id,
      },
    });

    return {
      tipo: 'asignados',
      datos: {
        correo,
        nombre: estudiante.nombre,
        apellido: estudiante.apellido,
        asignacion,
      },
    };
  });

  const resultadosProcesados = await Promise.all(procesos);

  resultadosProcesados.forEach((item) => {
    resultado[item.tipo].push(item.datos);
  });

  return resultado;
};

const obtenerEstudiantesPorCurso = async (refCurso) => {
  const estudiantes = await prisma.estudianteCurso.findMany({
    where: {
      refCurso,
    },
    include: {
      estudiante: true,
    },
  });

  return estudiantes;
};

const obtenerCursosPorEstudiante = async (refEstudiante) => {
  const cursos = await prisma.estudianteCurso.findMany({
    where: {
      refEstudiante,
    },
    include: {
      curso: true,
    },
  });

  return cursos;
};

const eliminarAsignacion = async (usuario, refCurso, refEstudiante) => {
  if (!tienePermiso(usuario)) {
    throw new Error('Usuario no tiene los permisos necesarios.');
  }

  const asignacionEncontrada = await prisma.estudianteCurso.findUnique({
    where: {
      refCurso_refEstudiante: {
        refCurso,
        refEstudiante,
      },
    },
  });

  if (!asignacionEncontrada) {
    throw new Error('La asignación no existe en la base de datos');
  }

  const asignacionEliminada = await prisma.estudianteCurso.delete({
    where: {
      refCurso_refEstudiante: {
        refCurso,
        refEstudiante,
      },
    },
  });

  return asignacionEliminada;
};

module.exports = {
  asignarEstudianteACurso,
  cargarEstudiantesDesdeCsv,
  obtenerEstudiantesPorCurso,
  obtenerCursosPorEstudiante,
  eliminarAsignacion,
};
