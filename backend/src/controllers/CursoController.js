const cursoService = require('../services/CursoService');

const crearCurso = async (req, res) => {
  try {
    // extraemos la inforamacion del cursos desde el body
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
      mensaje: error.message || 'Erro al tratar de crar el curso',
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

module.exports = {
  crearCurso,
  obtenerCursos,
  obtenerCursoPorId,
};
