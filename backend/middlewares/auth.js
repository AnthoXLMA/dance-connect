const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token d'authentification manquant." });
  }

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) return res.status(403).json({ error: "Token invalide ou expiré." });
    req.user = user;
    next();
  });
}

function generateToken(payload) {
  return jwt.sign(payload, jwtSecret, { expiresIn: "1h" });
}

module.exports = { authenticateToken, generateToken };
