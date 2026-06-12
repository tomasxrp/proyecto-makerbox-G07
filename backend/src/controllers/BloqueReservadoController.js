const bloqueReservadoService = require('../services/BloqueReservadoService');

const crearBloqueReservado = async (req, res) => {
  try {
    const { bloqueId, reservaId } = req.body;

    const nuevoBloqueReservado =
      await bloqueReservadoService.crearBloqueReservado({
        bloqueId,
        reservaId,
      });

    res.status(201).json({
      mensaje: 'Bloque reservado creado exitosamente',
      bloqueReservado: nuevoBloqueReservado,
    });
  } catch (error) {
    res.status(400).json({
      mensaje: error.message || 'Error al crear el bloque reservado',
    });
  }
};

const obtenerBloqueReservados = async (req, res) => {
  try {
    const bloques = await bloqueReservadoService.obtenerBloqueReservados();

    res.status(200).json({
      mensaje: 'Todos los bloques reservados obtenidos exitosamente',
      bloques,
    });
  } catch (error) {
    res.status(400).json({
      mensaje: error.message || 'Error al obtener los bloques reservados',
    });
  }
};

const obtenerBloqueReservadosPorReserva = async (req, res) => {
  try {
    const { reservaId } = req.params;

    const bloques =
      await bloqueReservadoService.obtenerBloqueReservadosPorReserva(reservaId);

    res.status(200).json({
      mensaje: 'Bloques reservados obtenidos exitosamente',
      bloques,
    });
  } catch (error) {
    res.status(400).json({
      mensaje: error.message || 'Error al obtener bloques reservados',
    });
  }
};

const obtenerBloqueReservadosPorBloque = async (req, res) => {
  try {
    const { bloqueId } = req.params;

    const bloques =
      await bloqueReservadoService.obtenerBloqueReservadosPorBloque(bloqueId);

    res.status(200).json({
      mensaje: 'Bloques reservados obtenidos exitosamente',
      bloques,
    });
  } catch (error) {
    res.status(400).json({
      mensaje: error.message || 'Error al obtener bloques reservados',
    });
  }
};

const obtenerBloqueReservadoPorId = async (req, res) => {
  try {
    const { bloqueId, reservaId } = req.params;

    const bloqueReservado =
      await bloqueReservadoService.obtenerBloqueReservadoPorId(
        bloqueId,
        reservaId
      );

    res.status(200).json({
      mensaje: 'Bloque reservado obtenido exitosamente',
      bloqueReservado,
    });
  } catch (error) {
    res.status(404).json({
      mensaje: error.message || 'Error al obtener el bloque reservado',
    });
  }
};

const verificarDisponibilidadBloque = async (req, res) => {
  try {
    const { bloqueId } = req.params;
    const { fechaReserva } = req.body;

    const disponible =
      await bloqueReservadoService.verificarDisponibilidadBloque(
        bloqueId,
        fechaReserva
      );

    res.status(200).json({
      mensaje: 'Disponibilidad verificada',
      disponible,
    });
  } catch (error) {
    res.status(400).json({
      mensaje: error.message || 'Error al verificar disponibilidad',
    });
  }
};

const eliminarBloqueReservado = async (req, res) => {
  try {
    const { bloqueId, reservaId } = req.params;

    await bloqueReservadoService.eliminarBloqueReservado(bloqueId, reservaId);

    res.status(200).json({
      mensaje: 'Bloque reservado eliminado exitosamente',
    });
  } catch (error) {
    res.status(400).json({
      mensaje: error.message || 'Error al eliminar el bloque reservado',
    });
  }
};

const eliminarBloquesPorReserva = async (req, res) => {
  try {
    const { reservaId } = req.params;

    await bloqueReservadoService.eliminarBloquesPorReserva(reservaId);

    res.status(200).json({
      mensaje: 'Bloques de la reserva eliminados exitosamente',
    });
  } catch (error) {
    res.status(400).json({
      mensaje: error.message || 'Error al eliminar los bloques de la reserva',
    });
  }
};

module.exports = {
  crearBloqueReservado,
  obtenerBloqueReservados,
  obtenerBloqueReservadosPorReserva,
  obtenerBloqueReservadosPorBloque,
  obtenerBloqueReservadoPorId,
  verificarDisponibilidadBloque,
  eliminarBloqueReservado,
  eliminarBloquesPorReserva,
};
