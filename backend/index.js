const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3001;
const JWT_SECRET = "ta_cle_secrete_très_longue_et_complexe"; // 🔐 à sécuriser dans .env plus tard

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Stockages temporaires (à remplacer par une base de données)
const users = [];
const profiles = {};
const messages = [];

// Middleware d'authentification JWT
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

// Route d'inscription
app.post("/api/signup", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis." });
  }

  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: "Email déjà utilisé." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ email, password: hashedPassword });

  res.json({ message: "Inscription réussie !" });
});

// Route de connexion
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email);
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

// Route POST pour créer ou mettre à jour un profil utilisateur
app.post("/api/profile", authenticateToken, (req, res) => {
  const email = req.user.email;
  const profileData = req.body;

  if (!profileData || typeof profileData !== "object") {
    return res.status(400).json({ error: "Données de profil invalides." });
  }

  profiles[email] = profileData;
  res.json({ message: "Profil enregistré avec succès !" });
});

// Route GET pour récupérer le profil
app.get("/api/profile", authenticateToken, (req, res) => {
  const email = req.user.email;
  const profile = profiles[email];

  if (!profile) {
    return res.status(404).json({ error: "Profil non trouvé." });
  }

  res.json({ email, ...profile });
});

// Route POST pour envoyer un message
app.post("/api/messages", authenticateToken, (req, res) => {
  const from = req.user.email;
  const { to, content } = req.body;

  if (!to || !content) {
    return res.status(400).json({ error: "Champs 'to' et 'content' requis." });
  }

  const message = {
    id: messages.length + 1,
    from,
    to,
    content,
    timestamp: new Date().toISOString(),
  };

  messages.push(message);
  res.status(201).json({ message: "Message envoyé avec succès", data: message });
});

// Route GET pour récupérer les messages d’un utilisateur
app.get("/api/messages", authenticateToken, (req, res) => {
  const email = req.user.email;
  const userMessages = messages.filter(
    (msg) => msg.from === email || msg.to === email
  );
  res.json(userMessages);
});

// GET /api/messages/received
router.get("/received", authenticateToken, async (req, res) => {
  try {
    const messages = await Message.find({ to: req.user.email }).sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération des messages" });
  }
});


// Lancement du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
