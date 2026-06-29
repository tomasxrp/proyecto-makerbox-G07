const grupoEstudianteService = require('../services/GrupoEstudianteService');

const asignarEstudianteAGrupo = async (req, res) => {
  try {
    const { refGrupo, refEstudiante } = req.body;
    const { usuario } = req;

    if (!refGrupo || !refEstudiante) {
      return res.status(400).json({
        mensaje: 'Los campos refGrupo y refEstudiante son obligatorios',
      });
    }

    const asignacion = await grupoEstudianteService.asignarEstudianteAGrupo(
      usuario,
      refGrupo,
      refEstudiante
    );

    return res.status(201).json({
      mensaje: 'Estudiante asignado al grupo exitosamente',
      asignacion,
    });
  } catch (error) {
    return res.status(401).json({
      mensaje: error.message || 'Error al tratar de asignar el estudiante al grupo',
    });
  }
};

const obtenerEstudiantesPorGrupo = async (req, res) => {
  try {
    const { refGrupo } = req.params;

    const estudiantes = await grupoEstudianteService.obtenerEstudiantesPorGrupo(refGrupo);

    return res.status(200).json({
      mensaje: 'Estudiantes del grupo obtenidos con éxito',
      estudiantes,
    });
  } catch (error) {
    return res.status(401).json({
      mensaje: error.message || 'Error al obtener los estudiantes del grupo',
    });
  }
};

const obtenerGruposPorEstudiante = async (req, res) => {
  try {
    const { refEstudiante } = req.params;

    const grupos = await grupoEstudianteService.obtenerGruposPorEstudiante(refEstudiante);

    return res.status(200).json({
      mensaje: 'Grupos del estudiante obtenidos con éxito',
      grupos,
    });
  } catch (error) {
    return res.status(401).json({
      mensaje: error.message || 'Error al obtener los grupos del estudiante',
    });
  }
};

const eliminarAsignacion = async (req, res) => {
  try {
    const { refGrupo, refEstudiante } = req.params;
    const { usuario } = req;

    const asignacion = await grupoEstudianteService.eliminarAsignacion(
      usuario,
      refGrupo,
      refEstudiante
    );

    return res.status(200).json({
      mensaje: 'Asignación eliminada con éxito',
      asignacion,
    });
  } catch (error) {
    return res.status(401).json({
      mensaje: error.message || 'Error al tratar de eliminar la asignación',
    });
  }
};

module.exports = {
  asignarEstudianteAGrupo,
  obtenerEstudiantesPorGrupo,
  obtenerGruposPorEstudiante,
  eliminarAsignacion,
};
