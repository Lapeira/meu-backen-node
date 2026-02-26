// 1. IMPORTAR FERRAMENTAS
require('dotenv').config(); // Carrega os segredos do ficheiro .env logo no início!
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // O novo tradutor para PostgreSQL

const app = express();

// 2. MIDDLEWARES
app.use(cors());
app.use(express.json());

// 3. LIGAÇÃO À BASE DE DADOS (O Cofre na Nuvem)
// O Node vai procurar a morada secreta no ficheiro .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Necessário para bases de dados na nuvem como o Neon
  }
});

// 4. CRIAR A TABELA AUTOMATICAMENTE (Se não existir)
// Repara que no Postgres usamos 'SERIAL' em vez de 'AUTOINCREMENT'
async function inicializarBaseDeDados() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projetos (
        id SERIAL PRIMARY KEY,
        titulo TEXT NOT NULL,
        tecnologia TEXT NOT NULL,
        concluido BOOLEAN DEFAULT FALSE
      )
    `);
    console.log("✅ Tabela 'projetos' verificada/criada no PostgreSQL (Neon)!");
  } catch (erro) {
    console.error("❌ Erro ao criar tabela:", erro);
  }
}
inicializarBaseDeDados();

// ==========================================
// 5. AS NOSSAS ROTAS (A API)
// ==========================================

// ROTA GET: Pedir todos os projetos
app.get('/api/projetos', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM projetos');
    res.json(resultado.rows); // O Postgres devolve os dados dentro de ".rows"
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao buscar projetos" });
  }
});

// ROTA POST: Adicionar um novo projeto
app.post('/api/projetos', async (req, res) => {
  const { titulo, tecnologia } = req.body;
  
  try {
    // O 'RETURNING *' é magia do Postgres para devolver a linha que acabou de ser criada
    const resultado = await pool.query(
      'INSERT INTO projetos (titulo, tecnologia) VALUES ($1, $2) RETURNING *',
      [titulo, tecnologia]
    );
    
    // Devolvemos o projeto novo (com o ID gerado na nuvem) ao Frontend (React)
    res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao inserir projeto" });
  }
});

// 6. LIGAR O SERVIDOR
// Usa a porta do .env, ou a 4000 se não encontrar
const PORTA = process.env.PORT || 4000;
app.listen(PORTA, () => {
  console.log(`🚀 Motor Full-Stack a rodar na porta ${PORTA}`);
});