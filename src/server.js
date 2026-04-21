const app = require('./app');
const pool = require('./config/db');

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

    console.log("✅ Tabela 'projetos' verificada/criada com sucesso.");
  } catch (erro) {
    console.error('❌ Erro ao inicializar base de dados:', erro);
  }
}

const PORTA = process.env.PORT || 4000;

async function arrancarServidor() {
  await inicializarBaseDeDados();

  app.listen(PORTA, () => {
    console.log(`🚀 Servidor a correr na porta ${PORTA}`);
  });
}

arrancarServidor();