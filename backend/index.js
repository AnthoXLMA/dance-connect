require('dotenv').config();

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const PORT = 3001;
const jwtSecret = process.env.JWT_SECRET;
const { authenticateToken, generateToken } = require("./middlewares/auth");

// Middlewares
app.use(cors({
  origin: "http://localhost:5173", // ou "*", en développement
  credentials: true
}));

app.use(bodyParser.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Stockages temporaires (à remplacer par une base de données)
const users = [];
const profiles = {};
const messages = [];

// Middleware d'authentification JWT


// 🔐 Auth routes
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

console.log("🔐 Clé JWT utilisée :", jwtSecret);

app.post("/api/login", async (req, res) => {
  console.log("Requête login reçue :", req.body);
  console.log("Utilisateurs enregistrés :", users);

  const { email, password } = req.body;

  const user = users.find((u) => u.email === email);
  if (!user) {
    console.log("Utilisateur non trouvé !");
    return res.status(401).json({ error: "Email ou mot de passe incorrect." });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    console.log("Mot de passe incorrect !");
    return res.status(401).json({ error: "Email ou mot de passe incorrect." });
  }

  const token = jwt.sign({ email: user.email }, jwtSecret, { expiresIn: "1h" });
  console.log("Connexion réussie, token généré.");
  res.json({ token });
});


// 👤 Profile routes
app.post("/api/profile", authenticateToken, (req, res) => {
  const email = req.user.email;
  const profileData = req.body;

  if (!profileData || typeof profileData !== "object") {
    return res.status(400).json({ error: "Données de profil invalides." });
  }

  profiles[email] = profileData;
  // Retourner le profil avec l'email
  res.json({ email, ...profileData });
});


app.get("/api/profile", authenticateToken, (req, res) => {
  const email = req.user.email;
  const profile = profiles[email];

  if (!profile) {
    return res.status(404).json({ error: "Profil non trouvé." });
  }

  res.json({ email, ...profile });
});

// 💬 Message routes
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

app.get("/api/messages", authenticateToken, (req, res) => {
  const email = req.user.email;
  const userMessages = messages.filter(
    (msg) => msg.from === email || msg.to === email
  );
  res.json(userMessages);
});

app.get("/api/messages/received", authenticateToken, (req, res) => {
  const email = req.user.email;
  const receivedMessages = messages.filter((msg) => msg.to === email);
  res.json(receivedMessages);
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
