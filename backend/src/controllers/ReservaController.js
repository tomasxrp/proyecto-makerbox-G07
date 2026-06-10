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

module.exports = {
  crearReserva,
  obtenerReservas,
  obtenerReservaPorId,
};