require('dotenv').config();
const express = require('express');
const cors = require('cors');
const projetosRoutes = require('./routes/projetos.routes');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/projetos', projetosRoutes);

app.use(errorMiddleware);

module.exports = app;