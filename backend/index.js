require('dotenv').config();

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const { authenticateToken, generateToken } = require("./middlewares/auth");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
const PORT = 3001;
const jwtSecret = process.env.JWT_SECRET;

const errorHandler = require('./middlewares/errorHandler');

// Middlewares globaux
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

const userRoutes = require("./routes/users");
app.use("/api/users", userRoutes);

// Routes de profil
const profileRoutes = require("./routes/profile");
app.use("/api/profile", profileRoutes);
app.use("/api/users", profileRoutes);

// 💬 Messagerie (en mémoire)
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

app.use(errorHandler);

// 🚀 Démarrage
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
