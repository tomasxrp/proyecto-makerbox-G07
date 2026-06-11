const grupoCursoService = require('../services/GrupoCursoService');

const crearGrupo = async (req, res) => {
  try {
    // extraemos la informacion desde el body
    const { refCurso, nombreGrupo } = req.body;
    const { usuario } = req;

    if (!refCurso || !nombreGrupo) {
      return res.status(400).json({
        mensaje: 'Los campos refCurso y nombreGrupo son obligatorios',
      });
    }

    const grupo = await grupoCursoService.crearGrupo(
      usuario,
      refCurso,
      nombreGrupo
    );

    return res.status(201).json({
      mensaje: 'Grupo creado exitosamente',
      grupo,
    });
  } catch (error) {
    return res.status(401).json({
      mensaje: error.message || 'Error al tratar de crear el grupo',
    });
  }
};

const obtenerGruposPorCurso = async (req, res) => {
  try {
    // extraemos el id del curso desde los parametros
    const { refCurso } = req.params;

    const grupos = await grupoCursoService.obtenerGruposPorCurso(refCurso);

    return res.status(200).json({
      mensaje: 'Grupos obtenidos con éxito',
      grupos,
    });
  } catch (error) {
    return res.status(401).json({
      mensaje: error.message || 'Error al obtener los grupos del curso',
    });
  }
};

const obtenerGrupoPorId = async (req, res) => {
  try {
    // extraemos el id del grupo desde los parametros
    const { grupoId } = req.params;

    const grupo = await grupoCursoService.obtenerGrupoPorId(grupoId);

    return res.status(200).json({
      grupo,
    });
  } catch (error) {
    return res.status(401).json({
      mensaje: error.message || 'Error al obtener el grupo',
    });
  }
};

const actualizarGrupo = async (req, res) => {
  try {
    // extraemos la informacion de los parametros y body
    const { grupoId } = req.params;
    const { usuario } = req;
    const data = req.body;

    const resultado = await grupoCursoService.actualizarGrupo(
      usuario,
      grupoId,
      data
    );

    return res.status(200).json(resultado);
  } catch (error) {
    return res.status(401).json({
      mensaje: error.message || 'Error al tratar de actualizar el grupo',
    });
  }
};

const eliminarGrupo = async (req, res) => {
  try {
    // extraemos el id desde los parametros
    const { grupoId } = req.params;
    const { usuario } = req;

    const grupoEliminado = await grupoCursoService.eliminarGrupo(
      usuario,
      grupoId
    );

    return res.status(200).json({
      mensaje: 'Grupo eliminado con exito',
      grupoEliminado,
    });
  } catch (error) {
    return res.status(401).json({
      mensaje: error.message || 'Error al tratar de eliminar el grupo',
    });
  }
};

module.exports = {
  crearGrupo,
  obtenerGruposPorCurso,
  obtenerGrupoPorId,
  actualizarGrupo,
  eliminarGrupo,
};
