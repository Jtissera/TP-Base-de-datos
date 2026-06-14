const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secure_secret_key_change_this_in_production';

function protectByRole(allowedRoles) {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access denied: Token not provided' });
    }

    try {
      const decodedUser = jwt.verify(token, JWT_SECRET);
      req.user = decodedUser;

      if (!allowedRoles.includes(decodedUser.role)) {
        return res.status(403).json({ error: 'Forbidden: You do not have the required permissions' });
      }

      next();
    } catch (error) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
  };
}

module.exports = protectByRole;