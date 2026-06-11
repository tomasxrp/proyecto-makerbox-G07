const reservaService = require('../services/ReservaService');

const crearReserva = async (req, res) => {
  try {
    const nuevaReserva = await reservaService.crearReserva(req.body);

    res.status(201).json({
      mensaje: 'Reserva creada exitosamente',
      reserva: nuevaReserva,
    });
  } catch (error) {
    res.status(400).json({
      mensaje: error.message || 'Error al crear la reserva',
    });
  }
};

const obtenerReservas = async (req, res) => {
  try {
    const { usuario } = req;
    const { estado, fecha } = req.query;

    const filtros = {};
    if (estado) filtros.estado = estado;
    if (fecha) filtros.fecha = fecha;

    const reservas = await reservaService.obtenerReservas(usuario, filtros);

    res.status(200).json({
      mensaje: 'Reservas obtenidas exitosamente',
      reservas,
    });
  } catch (error) {
    res.status(401).json({
      mensaje: error.message || 'Error al obtener reservas',
    });
  }
};

const obtenerReservaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const reserva = await reservaService.obtenerReservaPorId(id);

    res.status(200).json({
      mensaje: 'Reserva obtenida exitosamente',
      reserva,
    });
  } catch (error) {
    res.status(404).json({
      mensaje: error.message || 'Error al obtener la reserva',
    });
  }
};

const actualizarReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const reserva = await reservaService.actualizarReserva(id, req.body);

    res.status(200).json({
      mensaje: 'Reserva actualizada exitosamente',
      reserva,
    });
  } catch (error) {
    res.status(400).json({
      mensaje: error.message || 'Error al actualizar la reserva',
    });
  }
};

const cancelarReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const reserva = await reservaService.cancelarReserva(id);

    res.status(200).json({
      mensaje: 'Reserva cancelada exitosamente',
      reserva,
    });
  } catch (error) {
    res.status(400).json({
      mensaje: error.message || 'Error al cancelar la reserva',
    });
  }
};

const confirmarReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario } = req;
    const reserva = await reservaService.confirmarReserva(id, usuario);

    res.status(200).json({
      mensaje: 'Reserva confirmada exitosamente',
      reserva,
    });
  } catch (error) {
    res.status(400).json({
      mensaje: error.message || 'Error al confirmar la reserva',
    });
  }
};

const eliminarReserva = async (req, res) => {
  try {
    const { id } = req.params;
    await reservaService.eliminarReserva(id);

    res.status(200).json({
      mensaje: 'Reserva eliminada exitosamente',
    });
  } catch (error) {
    res.status(400).json({
      mensaje: error.message || 'Error al eliminar la reserva',
    });
  }
};

module.exports = {
  crearReserva,
  obtenerReservas,
  obtenerReservaPorId,
  actualizarReserva,
  cancelarReserva,
  confirmarReserva,
  eliminarReserva,
};