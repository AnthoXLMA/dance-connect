require('dotenv').config();

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const { authenticateToken } = require("./middlewares/auth");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
const PORT = 3001;
const jwtSecret = process.env.JWT_SECRET;

// Middlewares globaux
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(bodyParser.json());

// Logger toutes les requêtes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// 🔐 Auth routes avec Prisma
app.post("/api/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email et mot de passe requis." });

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "Email déjà utilisé." });

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    res.json({ message: "Inscription réussie !" });
  } catch (error) {
    console.error("Erreur lors de l'inscription :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Email ou mot de passe incorrect." });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ error: "Email ou mot de passe incorrect." });

    const token = jwt.sign({ email: user.email }, jwtSecret, { expiresIn: "1h" });
    console.log("✅ Connexion réussie pour", email);
    res.json({ token });
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// app.js ou index.js
const profileRoutes = require("./routes/profile");
app.use("/api/profile", profileRoutes);


// 💬 Messagerie (encore en mémoire)
const messages = [];

app.post("/api/messages", authenticateToken, (req, res) => {
  const from = req.user.email;
  const { to, content } = req.body;

  if (!to || !content) return res.status(400).json({ error: "Champs 'to' et 'content' requis." });

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
  const userMessages = messages.filter((msg) => msg.from === email || msg.to === email);
  res.json(userMessages);
});

app.get("/api/messages/received", authenticateToken, (req, res) => {
  const email = req.user.email;
  const receivedMessages = messages.filter((msg) => msg.to === email);
  res.json(receivedMessages);
});

// 📅 Event routes
const eventRoutes = require('./routes/events');
app.use('/api/events', eventRoutes);

// 🚀 Démarrage
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
