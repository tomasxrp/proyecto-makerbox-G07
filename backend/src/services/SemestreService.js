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

module.exports = {
  crearSemestre,
};
