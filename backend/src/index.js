require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const usuarioRoutes = require('./routes/UsuarioRoutes');
const semestreRoutes = require('./routes/SemestreRoutes');
const articuloRoutes = require('./routes/ArticuloRoutes');
const cursoRoutes = require('./routes/CursoRoutes');
const impresionRoutes = require('./routes/ImpresionRoutes');
const bloqueHorarioRoutes = require('./routes/BloqueHorarioRoutes');
const reservaRoutes = require('./routes/ReservaRoutes');
const bloqueReservadoRoutes = require('./routes/BloqueReservadoRoutes');
const estudianteCursoRoutes = require('./routes/EstudianteCursoRoutes');
const grupoCursoRoutes = require('./routes/GrupoCursoRoutes');
const usoImpresionRoutes = require('./routes/UsoImpresionRoutes');
const ayudantiaRoutes = require('./routes/AyudantiaRoutes');
const ayudanteCursoRoutes = require('./routes/AyudanteCursoRoutes');
const grupoEstudianteRoutes = require('./routes/GrupoEstudianteRoutes');
const inscripcionAyudantiaRoutes = require('./routes/InscripcionAyudantiaRoutes');

const app = express();
// Se define el puerto que se usara, si no se define se usara el puerto 3000
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/semestre', semestreRoutes);
app.use('/api/articulo', articuloRoutes);
app.use('/api/curso', cursoRoutes);
app.use('/api/impresion', impresionRoutes);
app.use('/api/bloque-horario', bloqueHorarioRoutes);
app.use('/api/reservas', reservaRoutes);
app.use('/api/bloque-reservado', bloqueReservadoRoutes);
app.use('/api/estudiante-curso', estudianteCursoRoutes);
app.use('/api/grupo-curso', grupoCursoRoutes);
app.use('/api/uso-impresion', usoImpresionRoutes);
app.use('/api/ayudantia', ayudantiaRoutes);
app.use('/api/ayudante', ayudanteCursoRoutes);
app.use('/api/grupo-estudiante', grupoEstudianteRoutes);
app.use('/api/inscripcion-ayudantia', inscripcionAyudantiaRoutes);
app.get('/', (req, res) => {
  res.send('Peticion GET recibida en el backend');
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    process.stdout.write(`Servidor escuchando en el puerto ${PORT}\n`);
  });
}

module.exports = app;
