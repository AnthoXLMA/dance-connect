const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticateToken } = require("../middlewares/auth");

const prisma = new PrismaClient();
const router = express.Router();

// 🟢 Swipe un utilisateur (like ou pass)
router.post("/", authenticateToken, async (req, res) => {
  const swiperId = req.user.id;
  const { swipedId, liked } = req.body;

  if (typeof liked !== "boolean" || !swipedId) {
    return res.status(400).json({ error: "Paramètres invalides." });
  }

  try {
    await prisma.swipe.create({
      data: {
        swiperId,
        swipedId,
        liked,
      },
    });
    res.json({ message: "Swipe enregistré." });
  } catch (error) {
    console.error("Erreur lors du swipe :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🧡 Liste des utilisateurs likés par l'utilisateur connecté
router.get("/liked", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const likes = await prisma.swipe.findMany({
      where: {
        swiperId: userId,
        liked: true,
      },
      include: {
        swiped: true,
      },
    });

    const likedUsers = likes.map((l) => ({
      id: l.swiped.id,
      username: l.swiped.username,
      firstName: l.swiped.firstName,
      lastName: l.swiped.lastName,
      avatarUrl: l.swiped.avatarUrl,
      bio: l.swiped.bio,
      dances: l.swiped.dances,
      levels: l.swiped.levels,
    }));

    res.json(likedUsers);
  } catch (error) {
    console.error("Erreur /swipes/liked :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/ids", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const swipes = await prisma.swipe.findMany({
      where: { swiperId: userId },
      select: { swipedId: true },
    });
    const swipedIds = swipes.map(s => s.swipedId);
    res.json(swipedIds);
  } catch (error) {
    console.error("Erreur /swipes/ids :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


module.exports = router;
