const express = require('express');
const cors = require('cors');
const usuarioRoutes = require('./routes/UsuarioRoutes');
require('dotenv').config();

const app = express();
// Se define el puerto que se usara, si no se define se usara el puerto 3000
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api/usuarios', usuarioRoutes);

app.get('/', (req, res) => {
  res.send('Peticion GET recibida en el backend');
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
