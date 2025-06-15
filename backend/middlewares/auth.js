require('dotenv').config();
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // ✅ extrait après "Bearer"

  if (!token) return res.sendStatus(401);

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

function generateToken(payload) {
  return jwt.sign(payload, jwtSecret, { expiresIn: "1h" });
}

module.exports = { authenticateToken, generateToken };

