const pool = require('../config/db');

async function getProjetos(req, res, next) {
  try {
    const resultado = await pool.query('SELECT * FROM projetos ORDER BY id DESC');
    res.json(resultado.rows);
  } catch (erro) {
    next(erro);
  }
}

async function criarProjeto(req, res, next) {
  const { titulo, tecnologia } = req.body;

  if (!titulo || !tecnologia) {
    return res.status(400).json({ erro: 'Título e tecnologia são obrigatórios.' });
  }

  try {
    const resultado = await pool.query(
      'INSERT INTO projetos (titulo, tecnologia) VALUES ($1, $2) RETURNING *',
      [titulo, tecnologia]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    next(erro);
  }
}

async function atualizarProjeto(req, res, next) {
  const { id } = req.params;
  const { titulo, tecnologia, concluido } = req.body;

  if (!titulo || !tecnologia) {
    return res.status(400).json({ erro: 'Título e tecnologia são obrigatórios.' });
  }

  try {
    const resultado = await pool.query(
      `UPDATE projetos
       SET titulo = $1, tecnologia = $2, concluido = $3
       WHERE id = $4
       RETURNING *`,
      [titulo, tecnologia, concluido ?? false, id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Projeto não encontrado.' });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    next(erro);
  }
}

async function apagarProjeto(req, res, next) {
  const { id } = req.params;

  try {
    const resultado = await pool.query(
      'DELETE FROM projetos WHERE id = $1 RETURNING *',
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Projeto não encontrado.' });
    }

    res.json({ mensagem: 'Projeto apagado com sucesso.' });
  } catch (erro) {
    next(erro);
  }
}

module.exports = {
  getProjetos,
  criarProjeto,
  atualizarProjeto,
  apagarProjeto,
};