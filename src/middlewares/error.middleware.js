function errorMiddleware(err, req, res, next) {
  console.error(err);

  res.status(err.status || 500).json({
    erro: err.message || 'Erro interno do servidor',
  });
}

module.exports = errorMiddleware;