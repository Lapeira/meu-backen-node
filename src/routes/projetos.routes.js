const express = require('express');
const {
  getProjetos,
  criarProjeto,
  atualizarProjeto,
  apagarProjeto,
} = require('../controllers/projetos.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', getProjetos);
router.post('/', authMiddleware, criarProjeto);
router.put('/:id', authMiddleware, atualizarProjeto);
router.delete('/:id', authMiddleware, apagarProjeto);

module.exports = router;