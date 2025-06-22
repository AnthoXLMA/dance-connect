const express = require("express");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, generateToken } = require("../middlewares/auth");

const prisma = new PrismaClient();
const router = express.Router();

// 🔐 Inscription
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email et mot de passe requis." });

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json({ error: "Email déjà utilisé." });

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

// 🔑 Connexion
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(401).json({ error: "Email ou mot de passe incorrect." });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      return res.status(401).json({ error: "Email ou mot de passe incorrect." });

    const token = generateToken({ id: user.id, email: user.email });
    res.json({ token });
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// 👤 Infos utilisateur connecté
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        firstName: true,
        email: true,
        lat: true,
        lng: true,
      },
    });

    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
