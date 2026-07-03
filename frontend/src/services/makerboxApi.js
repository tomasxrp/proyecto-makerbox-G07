import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const getAuthConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const listarCursos = async (token) => {
  const response = await axios.get(
    `${API_URL}/api/curso`,
    getAuthConfig(token)
  );
  return response.data.cursos || [];
};

export const listarSemestres = async (token) => {
  const response = await axios.get(
    `${API_URL}/api/semestre`,
    getAuthConfig(token)
  );
  return response.data.semestres || [];
};

export const crearCurso = async (token, payload) => {
  const response = await axios.post(
    `${API_URL}/api/curso/crear`,
    payload,
    getAuthConfig(token)
  );

  return response.data.nuevoCurso;
};

export const listarUsuarios = async (token) => {
  const response = await axios.get(
    `${API_URL}/api/usuarios`,
    getAuthConfig(token)
  );
  return response.data.usuarios || [];
};

export const listarEstudiantesCurso = async (token, cursoId) => {
  const response = await axios.get(
    `${API_URL}/api/estudiante-curso/curso/${cursoId}`,
    getAuthConfig(token)
  );
  return response.data.estudiantes || [];
};

export const cargarCsvEstudiantes = async (token, cursoId, archivo) => {
  const formData = new FormData();
  formData.append('refCurso', cursoId);
  formData.append('archivo', archivo);

  const response = await axios.post(
    `${API_URL}/api/estudiante-curso/cargar-csv`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data.resultado;
};

export const listarAyudantesCurso = async (token, cursoId) => {
  const response = await axios.get(
    `${API_URL}/api/curso/${cursoId}/ayudantes`,
    getAuthConfig(token)
  );
  return response.data.ayudantes || [];
};

export const asignarAyudanteCurso = async (token, cursoId, usuarioId) => {
  const response = await axios.post(
    `${API_URL}/api/curso/${cursoId}/ayudantes`,
    { usuarioId },
    getAuthConfig(token)
  );
  return response.data.relacion;
};

export const eliminarAyudanteCurso = async (token, cursoId, usuarioId) => {
  const response = await axios.delete(
    `${API_URL}/api/curso/${cursoId}/ayudantes/${usuarioId}`,
    getAuthConfig(token)
  );
  return response.data.relacion;
};

export const listarMisCursos = async (token, userId = '') => {
  try {
    const response = await axios.get(
      `${API_URL}/api/curso/mis-cursos`,
      getAuthConfig(token)
    );
    return response.data.cursos || [];
  } catch (error) {
    if (!userId) {
      throw error;
    }

    const response = await axios.get(
      `${API_URL}/api/estudiante-curso/estudiante/${userId}`,
      getAuthConfig(token)
    );

    return (response.data.cursos || [])
      .map((asignacion) => asignacion.curso)
      .filter(Boolean);
  }
};

export const listarCursosDisponibles = async (token, userId = '') => {
  try {
    const response = await axios.get(
      `${API_URL}/api/curso/disponibles`,
      getAuthConfig(token)
    );
    return response.data.cursos || [];
  } catch (error) {
    const [todosCursos, misCursos] = await Promise.all([
      listarCursos(token),
      listarMisCursos(token, userId),
    ]);

    const idsMisCursos = new Set(misCursos.map((curso) => curso.id));
    return todosCursos.filter((curso) => !idsMisCursos.has(curso.id));
  }
};

export const inscribirseEnCurso = async (token, cursoId) => {
  const response = await axios.post(
    `${API_URL}/api/curso/${cursoId}/inscribir`,
    {},
    getAuthConfig(token)
  );
  return response.data.inscripcion;
};

export const listarMisSolicitudes = async (token) => {
  const response = await axios.get(
    `${API_URL}/api/impresion`,
    getAuthConfig(token)
  );
  return response.data.impresiones || [];
};

export const crearSolicitudImpresion = async (token, payload) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    formData.append(key, value);
  });

  const response = await axios.post(
    `${API_URL}/api/impresion/crear`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data.impresion;
};

export const listarGruposCurso = async (token, cursoId) => {
  const response = await axios.get(
    `${API_URL}/api/grupo-curso/curso/${cursoId}`,
    getAuthConfig(token)
  );

  return response.data.grupos || [];
};

export const crearGrupoCurso = async (token, cursoId, nombreGrupo) => {
  const response = await axios.post(
    `${API_URL}/api/grupo-curso/crear`,
    { refCurso: cursoId, nombreGrupo },
    getAuthConfig(token)
  );

  return response.data.grupo;
};

export const listarEstudiantesGrupo = async (token, grupoId) => {
  const response = await axios.get(
    `${API_URL}/api/grupo-estudiante/grupo/${grupoId}`,
    getAuthConfig(token)
  );

  return response.data.estudiantes || [];
};

export const asignarEstudianteGrupo = async (token, grupoId, estudianteId) => {
  const response = await axios.post(
    `${API_URL}/api/grupo-estudiante/asignar`,
    { refGrupo: grupoId, refEstudiante: estudianteId },
    getAuthConfig(token)
  );

  return response.data.asignacion;
};

export const listarCursosAyudante = async (token) => {
  const response = await axios.get(
    `${API_URL}/api/ayudante/mis-cursos`,
    getAuthConfig(token)
  );
  return response.data.cursos || [];
};

export const listarSolicitudesAyudante = async (token) => {
  const response = await axios.get(
    `${API_URL}/api/ayudante/solicitudes`,
    getAuthConfig(token)
  );
  return response.data.solicitudes || [];
};

export const actualizarSolicitudAyudante = async (token, id, payload) => {
  const response = await axios.put(
    `${API_URL}/api/ayudante/solicitudes/${id}`,
    payload,
    getAuthConfig(token)
  );
  return response.data.solicitud;
};
