const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = 3001;
const JWT_SECRET = "ta_cle_secrete_très_longue_et_complexe";

// Stockage temporaire en mémoire (à remplacer par une base de données)
const users = [];

// Route inscription
app.post("/api/signup", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis." });
  }

  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: "Email déjà utilisé." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  users.push({ email, password: hashedPassword });
  res.json({ message: "Inscription réussie !" });
});

// Route connexion
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ error: "Email ou mot de passe incorrect." });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ error: "Email ou mot de passe incorrect." });
  }

  const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// Middleware pour protéger les routes
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Exemple de route protégée
app.get("/api/profile", authenticateToken, (req, res) => {
  res.json({ email: req.user.email, message: "Voici votre profil sécurisé." });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
