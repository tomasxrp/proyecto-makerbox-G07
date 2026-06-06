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

module.exports = {
  crearCurso,
};
