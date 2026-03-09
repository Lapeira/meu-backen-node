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

// ROTA POST: Adicionar um novo projeto (AGORA PROTEGIDA!)
app.post('/api/projetos', async (req, res) => {
  // 1. O SEGURANÇA À PORTA
  // Vamos ler o "bilhete VIP" que vem no cabeçalho do pedido
  const bilheteVip = req.headers.authorization;

  // Se o bilhete não existir ou for diferente da nossa CHAVE_SECRETA...
  if (bilheteVip !== process.env.CHAVE_SECRETA) {
    console.log("🚨 Alerta de Intruso! Tentativa de adicionar projeto bloqueada.");
    return res.status(401).json({ erro: "Acesso Negado! Tu não és o Lapeira." });
  }

  // 2. SE PASSAR O SEGURANÇA, O CÓDIGO CONTINUA NORMALMENTE
  const { titulo, tecnologia } = req.body;
  
  try {
    const resultado = await pool.query(
      'INSERT INTO projetos (titulo, tecnologia) VALUES ($1, $2) RETURNING *',
      [titulo, tecnologia]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao inserir projeto" });
  }
});


// ROTA DELETE: Apagar um projeto (PROTEGIDA!)
// O ":id" no link significa que o frontend vai mandar o número do projeto (ex: /api/projetos/5)
app.delete('/api/projetos/:id', async (req, res) => {
  // 1. O SEGURANÇA À PORTA (Não queremos que qualquer pessoa apague as tuas coisas!)
  const bilheteVip = req.headers.authorization;
  if (bilheteVip !== process.env.CHAVE_SECRETA) {
    return res.status(401).json({ erro: "Acesso Negado! Tu não podes apagar." });
  }

  // 2. DESCOBRIR QUAL É O PROJETO A APAGAR
  const idDoProjeto = req.params.id; 
  
  try {
    // 3. MANDAR O COMANDO DE DESTRUIÇÃO AO POSTGRESQL
    await pool.query('DELETE FROM projetos WHERE id = $1', [idDoProjeto]);
    res.status(200).json({ mensagem: "Projeto apagado com sucesso!" });
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao apagar projeto" });
  }
});

// 6. LIGAR O SERVIDOR
// Usa a porta do .env, ou a 4000 se não encontrar
const PORTA = process.env.PORT || 4000;
app.listen(PORTA, () => {
  console.log(`🚀 Motor Full-Stack a rodar na porta ${PORTA}`);
});