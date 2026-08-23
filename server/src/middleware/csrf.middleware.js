function getAllowedOrigins() {
  if (process.env.NODE_ENV === 'production') {
    return process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [];
  }
  return [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    process.env.FRONTEND_URL,
  ].filter(Boolean);
}

export function csrfGuard(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  if (req.headers.authorization?.startsWith('Bearer ')) return next();

  const origin = req.headers.origin;
  const referer = req.headers.referer;
  const allowed = getAllowedOrigins();

  if (origin && allowed.includes(origin)) return next();

  if (referer && allowed.some((o) => referer.startsWith(o))) return next();

  if (!origin && !referer && process.env.NODE_ENV !== 'production') return next();

  return res.status(403).json({ message: 'CSRF validation failed' });
}