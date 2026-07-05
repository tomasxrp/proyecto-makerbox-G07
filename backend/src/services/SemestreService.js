// AGREGO ESTE COMENTARIO PARA PROBAR LOS TEST UNITARIOS Y DE INTEGRACION
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const crearSemestre = async (
  usuario,
  anio,
  periodo,
  fechaInicio,
  fechaFin,
  estado
) => {
  // Validar que el usuario tenga los permisos necesarios
  if (usuario.rol !== 'ADMINISTRADOR') {
    throw new Error('Usuario no tiene los permisos necesarios.');
  }

  // se crea el semestre en la base de datos
  const nuevoSemestre = await prisma.semestre.create({
    data: {
      anio,
      periodo,
      fechaInicio: new Date(fechaInicio),
      fechaFin: new Date(fechaFin),
      estado,
    },
  });

  return {
    mensaje: 'Semestre creado con exito',
    nuevoSemestre,
  };
};

const eliminarSemestre = async (usuario, semestreId) => {
  // Validar que el usuario tenga los permisos necesarios)
  if (usuario.rol !== 'ADMINISTRADOR') {
    throw new Error('Usuario no tiene los permisos necesarios.');
  }

  const semestreEncontrado = await prisma.semestre.findUnique({
    where: {
      id: semestreId,
    },
  });

  if (!semestreEncontrado) {
    throw new Error('El semestre no existe en la base de datos');
  }

  const semestreEliminado = await prisma.semestre.delete({
    where: {
      id: semestreId,
    },
  });

  return {
    mensaje: 'Semestre eliminado con exito',
    semestreEliminado,
  };
};

const obtenerTodosLosSemestres = async () => {
  const semestres = await prisma.semestre.findMany({
    select: {
      id: true,
      anio: true,
      periodo: true,
      fechaInicio: true,
      fechaFin: true,
      estado: true,
    },
  });

  return semestres;
};

const obtenerSemestrePorId = async (semestreId) => {
  const semestre = await prisma.semestre.findUnique({
    where: {
      id: semestreId,
    },
  });

  if (!semestre) {
    throw new Error('El semestre no existe en la base de datos');
  }

  return semestre;
};

module.exports = {
  crearSemestre,
  eliminarSemestre,
  obtenerTodosLosSemestres,
  obtenerSemestrePorId,
};
