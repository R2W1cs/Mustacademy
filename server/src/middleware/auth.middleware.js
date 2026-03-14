import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'No auth header' });
  }

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Bad auth format' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
