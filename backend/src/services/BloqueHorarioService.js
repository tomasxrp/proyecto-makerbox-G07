const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const crearBloqueHorario = async(
    usuario,
    nroBloque,
    horaInicio,
    horaFin
) => {
    // Validar permisos necesarios 
    if (usuario.rol !== 'ADMINISTRADOR') {
        throw new Error('Usuario no tiene los permisos necesarios.');
    }
    
    const nuevoBloque = await prisma.bloqueHorario.create({
      data: {
        nroBloque,
        horaInicio,
        horaFin
      },
    });

    return nuevoBloque;
}

module.exports = {
  crearBloqueHorario,
};