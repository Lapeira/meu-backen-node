function authMiddleware(req, res, next) {
  const bilheteVip = req.headers.authorization;

  if (bilheteVip !== process.env.CHAVE_SECRETA) {
    return res.status(401).json({ erro: 'Acesso negado.' });
  }

  next();
}

module.exports = authMiddleware;