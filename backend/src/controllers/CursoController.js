const cursoService = require('../services/CursoService');

const crearCurso = async (req, res) => {
  try {
    const { nombre, refSemestre, refProfesor } = req.body;
    const { usuario } = req;

    const nuevoCurso = await cursoService.crearCurso(
      usuario,
      nombre,
      refSemestre,
      refProfesor
    );

    res.status(200).json({
      nuevoCurso,
    });
  } catch (error) {
    res.status(401).json({
      mensaje: error.message || 'Error al tratar de crear el curso',
    });
  }
};

const obtenerCursos = async (req, res) => {
  try {
    const cursos = await cursoService.obtenerCursos();
    res.status(200).json({
      cursos,
    });
  } catch (error) {
    res.status(401).json({
      mensaje: error.message || 'Error al tratar de obtener los cursos',
    });
  }
};

const obtenerCursoPorId = async (req, res) => {
  try {
    const { cursoId } = req.params;
    const curso = await cursoService.obtenerCursoPorId(cursoId);
    res.status(200).json({
      curso,
    });
  } catch (error) {
    res.status(401).json({
      mensaje: error.message || 'Error al obtener el curso',
    });
  }
};

const obtenerCursosDisponibles = async (req, res) => {
  try {
    const { usuario } = req;
    const cursos = await cursoService.obtenerCursosDisponibles(usuario);

    res.status(200).json({
      cursos,
    });
  } catch (error) {
    res.status(401).json({
      mensaje: error.message || 'Error al obtener cursos disponibles',
    });
  }
};

const obtenerMisCursos = async (req, res) => {
  try {
    const { usuario } = req;
    const cursos = await cursoService.obtenerMisCursos(usuario);

    res.status(200).json({
      cursos,
    });
  } catch (error) {
    res.status(401).json({
      mensaje: error.message || 'Error al obtener cursos inscritos',
    });
  }
};

const inscribirEnCurso = async (req, res) => {
  try {
    const { usuario } = req;
    const { cursoId } = req.params;

    const inscripcion = await cursoService.inscribirEnCurso(usuario, cursoId);

    res.status(201).json({
      mensaje: 'Inscripción realizada con éxito',
      inscripcion,
    });
  } catch (error) {
    res.status(400).json({
      mensaje: error.message || 'Error al inscribir en el curso',
    });
  }
};

const obtenerAyudantesCurso = async (req, res) => {
  try {
    const { usuario } = req;
    const { cursoId } = req.params;

    const ayudantes = await cursoService.obtenerAyudantesCurso(
      usuario,
      cursoId
    );

    res.status(200).json({
      ayudantes,
    });
  } catch (error) {
    res.status(401).json({
      mensaje: error.message || 'Error al obtener ayudantes del curso',
    });
  }
};

const asignarAyudanteCurso = async (req, res) => {
  try {
    const { usuario } = req;
    const { cursoId } = req.params;
    const { usuarioId } = req.body;

    if (!usuarioId) {
      return res.status(400).json({
        mensaje: 'Debes indicar el usuarioId del estudiante',
      });
    }

    const relacion = await cursoService.asignarAyudanteCurso(
      usuario,
      cursoId,
      usuarioId
    );

    return res.status(201).json({
      mensaje: 'Ayudante asignado al curso exitosamente',
      relacion,
    });
  } catch (error) {
    return res.status(400).json({
      mensaje: error.message || 'Error al asignar ayudante al curso',
    });
  }
};

const eliminarAyudanteCurso = async (req, res) => {
  try {
    const { usuario } = req;
    const { cursoId, usuarioId } = req.params;

    const relacionEliminada = await cursoService.eliminarAyudanteCurso(
      usuario,
      cursoId,
      usuarioId
    );

    res.status(200).json({
      mensaje: 'Ayudante removido del curso',
      relacion: relacionEliminada,
    });
  } catch (error) {
    res.status(400).json({
      mensaje: error.message || 'Error al eliminar ayudante del curso',
    });
  }
};

const eliminarCurso = async (req, res) => {
  try {
    // extraemos la informacion de los parametros
    const { cursoId } = req.params;
    const { usuario } = req;

    const cursoEliminado = await cursoService.eliminarCurso(usuario, cursoId);

    res.status(200).json({
      cursoEliminado,
    });
  } catch (error) {
    res.status(401).json({
      mensaje: error.message || 'Error al tratar de eliminar el curso',
    });
  }
};

const actualizarCurso = async (req, res) => {
  try {
    // extraemos la informacion de los parametros y body
    const { cursoId } = req.params;
    const { usuario } = req;
    const data = req.body;

    const resultado = await cursoService.actualizarCurso(
      usuario,
      cursoId,
      data
    );

    res.status(200).json(resultado);
  } catch (error) {
    res.status(401).json({
      mensaje: error.message || 'Error al tratar de actualizar el curso',
    });
  }
};

module.exports = {
  crearCurso,
  obtenerCursos,
  obtenerCursoPorId,
  obtenerCursosDisponibles,
  obtenerMisCursos,
  inscribirEnCurso,
  obtenerAyudantesCurso,
  asignarAyudanteCurso,
  eliminarAyudanteCurso,
  eliminarCurso,
  actualizarCurso,
};
