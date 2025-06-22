// routes/profile.js
const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { authenticateToken } = require("../middlewares/auth");

const prisma = new PrismaClient();

router.get("/", authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.user.email },
      select: {
        id: true,
        email: true,
        firstName: true,
        likes: {
          select: {
            event: true,
          },
        },
      },
    });

    if (!user) return res.status(404).json({ error: "Profil non trouvé." });

    res.json(user);
  } catch (error) {
    console.error("Erreur dans GET /api/profile :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

router.get('/nearby', (req, res) => {
  // Exemple : renvoyer une liste vide ou fake data
  res.json([{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]);
});

module.exports = router;
