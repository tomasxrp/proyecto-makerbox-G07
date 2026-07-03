const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { validarToken } = require('../middlewares/validarToken');
const impresionController = require('../controllers/ImpresionController');

const router = Router();

const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'impresiones');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, extension)
      .replace(/\s+/g, '-');
    cb(null, `${Date.now()}-${base}${extension}`);
  },
});

const upload = multer({ storage });

router.post(
  '/crear',
  validarToken,
  upload.fields([
    { name: 'modelo3d', maxCount: 1 },
    { name: 'modeloStl', maxCount: 1 },
  ]),
  impresionController.crearImpresion
);
router.get('/', validarToken, impresionController.obtenerImpresiones);
router.put(
  '/:impresionId/estado',
  validarToken,
  impresionController.cambiarEstadoImpresion
);

module.exports = router;
