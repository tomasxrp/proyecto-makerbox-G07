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
  eliminarCurso,
  actualizarCurso,
};
