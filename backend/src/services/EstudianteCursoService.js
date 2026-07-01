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

const obtenerValorCsv = (registro, posiblesColumnas) => {
  const columnaEncontrada = posiblesColumnas.find(
    (columna) => registro[columna]
  );

  if (!columnaEncontrada) {
    return '';
  }

  return String(registro[columnaEncontrada]).trim();
};

const cargarEstudiantesDesdeCsv = async (usuario, refCurso, archivoBuffer) => {
  if (!tienePermiso(usuario)) {
    throw new Error('Usuario no tiene los permisos necesarios.');
  }

  const curso = await prisma.curso.findUnique({
    where: {
      id: refCurso,
    },
  });

  if (!curso) {
    throw new Error('El curso no existe');
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
    pendientes: [],
    yaAsignados: [],
    noValidos: [],
  };

  const procesarRegistro = async (registro) => {
    const correo = obtenerValorCsv(registro, [
      'correo',
      'email',
      'Correo',
      'Email',
      'Dirección de correo',
      'Direccion de correo',
    ]);

    const rut = obtenerValorCsv(registro, ['rut', 'RUT', 'Rut']);
    const nombre = obtenerValorCsv(registro, ['nombre', 'Nombre']);
    const apellido = obtenerValorCsv(registro, ['apellido', 'Apellido']);

    if (!correo) {
      resultado.noValidos.push({
        fila: registro,
        motivo: 'Correo no encontrado en la fila',
      });
      return;
    }

    const estudiante = await prisma.usuario.findFirst({
      where: {
        OR: [{ correo }, ...(rut ? [{ rut }] : [])],
      },
    });

    if (estudiante && estudiante.usuarioRol !== 'ESTUDIANTE') {
      resultado.noValidos.push({
        correo,
        rut,
        motivo: 'El usuario existe, pero no tiene rol ESTUDIANTE',
      });
      return;
    }

    if (!estudiante) {
      const pendiente = await prisma.estudianteCursoPendiente.upsert({
        where: {
          refCurso_correo: {
            refCurso,
            correo,
          },
        },
        update: {
          rut: rut || null,
          nombre: nombre || null,
          apellido: apellido || null,
        },
        create: {
          refCurso,
          rut: rut || null,
          correo,
          nombre: nombre || null,
          apellido: apellido || null,
        },
      });

      resultado.pendientes.push({
        correo,
        rut,
        nombre,
        apellido,
        pendiente,
        motivo:
          'El estudiante aún no está registrado. Quedó pendiente para vincularse automáticamente al registrarse.',
      });
      return;
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
      resultado.yaAsignados.push({
        correo,
        nombre: estudiante.nombre,
        apellido: estudiante.apellido,
      });
      return;
    }

    const asignacion = await prisma.estudianteCurso.create({
      data: {
        refCurso,
        refEstudiante: estudiante.id,
      },
    });

    resultado.asignados.push({
      correo,
      nombre: estudiante.nombre,
      apellido: estudiante.apellido,
      asignacion,
    });
  };

  await registros.reduce(
    (promesaAnterior, registro) =>
      promesaAnterior.then(() => procesarRegistro(registro)),
    Promise.resolve()
  );

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
