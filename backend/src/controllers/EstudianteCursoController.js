const estudianteCursoService = require('../services/EstudianteCursoService');

const asignarEstudianteACurso = async (req, res) => {
  try {
    // extraemos la informacion desde el body
    const { refCurso, refEstudiante } = req.body;
    const { usuario } = req;

    if (!refCurso || !refEstudiante) {
      return res.status(400).json({
        mensaje: 'Los campos refCurso y refEstudiante son obligatorios',
      });
    }

    const asignacion = await estudianteCursoService.asignarEstudianteACurso(
      usuario,
      refCurso,
      refEstudiante
    );

    return res.status(201).json({
      mensaje: 'Estudiante asignado al curso exitosamente',
      asignacion,
    });
  } catch (error) {
    return res.status(401).json({
      mensaje:
        error.message || 'Error al tratar de asignar el estudiante al curso',
    });
  }
};

const obtenerEstudiantesPorCurso = async (req, res) => {
  try {
    // extraemos el id del curso desde los parametros
    const { refCurso } = req.params;

    const estudiantes =
      await estudianteCursoService.obtenerEstudiantesPorCurso(refCurso);

    return res.status(200).json({
      mensaje: 'Estudiantes del curso obtenidos con éxito',
      estudiantes,
    });
  } catch (error) {
    return res.status(401).json({
      mensaje: error.message || 'Error al obtener los estudiantes del curso',
    });
  }
};

const obtenerCursosPorEstudiante = async (req, res) => {
  try {
    // extraemos el id del estudiante desde los parametros
    const { refEstudiante } = req.params;

    const cursos =
      await estudianteCursoService.obtenerCursosPorEstudiante(refEstudiante);

    return res.status(200).json({
      mensaje: 'Cursos del estudiante obtenidos con éxito',
      cursos,
    });
  } catch (error) {
    return res.status(401).json({
      mensaje: error.message || 'Error al obtener los cursos del estudiante',
    });
  }
};

const eliminarAsignacion = async (req, res) => {
  try {
    // extraemos los ids desde los parametros
    const { refCurso, refEstudiante } = req.params;
    const { usuario } = req;

    const asignacion = await estudianteCursoService.eliminarAsignacion(
      usuario,
      refCurso,
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
  asignarEstudianteACurso,
  obtenerEstudiantesPorCurso,
  obtenerCursosPorEstudiante,
  eliminarAsignacion,
};
