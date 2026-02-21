const jwt = require('jsonwebtoken');
require('dotenv').config();

function isAuthenticated(req, res, next) {
  // Check for the presence of an authorization header or x-auth-token header
  let token = req.headers.authorization || req.headers['x-auth-token'];
  
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // If using Authorization header, extract the token after "Bearer"
  if (token.startsWith('Bearer ')) {
    token = token.split(' ')[1];
  }

  try {
    // Verify the token using the JWT library and the secret key
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedToken;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

module.exports = isAuthenticated;
