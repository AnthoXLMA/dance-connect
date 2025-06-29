const express = require("express");
const router = express.Router();
const path = require("path");
const { authenticateToken } = require(path.resolve(__dirname, "../middlewares/auth"));
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Route test simple
router.get("/test", (req, res) => {
  res.json({ message: "Route events OK" });
});

// ✅ GET : Récupérer tous les événements (route : /api/events)
router.get("/", async (req, res) => {
  try {
    const events = await prisma.event.findMany();
    res.json(events);
  } catch (error) {
    console.error("❌ Erreur récupération events :", error.message);
    res.status(500).json({ error: "Erreur lors de la récupération des événements." });
  }
});

// routes/events.js
router.post("/", authenticateToken, async (req, res) => {
  const { name, dances, lat, lng } = req.body;
  if (!name || !lat || !lng) return res.status(400).json({ error: "Données manquantes" });

  try {
    const event = await prisma.event.create({
      data: {
        name,
        dances,
        lat,
        lng,
        creatorEmail: req.user.email, // optionnel
      },
    });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});


// ✅ POST : Liker un événement (route : /api/events/:id/like)
router.post("/:id/like", authenticateToken, async (req, res) => {
  const eventId = parseInt(req.params.id);
  const userEmail = req.user.email;

  console.log("eventId:", eventId, "userEmail:", userEmail);

  if (!eventId || isNaN(eventId)) {
    return res.status(400).json({ error: "ID d'événement manquant ou invalide." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) {
      console.log("Utilisateur non trouvé pour email :", userEmail);
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      console.log("Événement non trouvé pour id :", eventId);
      return res.status(404).json({ error: "Événement non trouvé." });
    }

    const existingLike = await prisma.like.findFirst({
      where: {
        userId: user.id,
        eventId: eventId,
      },
    });

    if (existingLike) {
      return res.status(200).json({ message: "Déjà liké." });
    }

    const like = await prisma.like.create({
      data: {
        user: { connect: { id: user.id } },
        event: { connect: { id: eventId } },
      },
    });

    console.log(`✅ ${userEmail} a liké l'événement ${eventId}`);
    res.status(201).json({ message: "Évènement liké avec succès.", like });
  } catch (error) {
    console.error("❌ Erreur Prisma :", error.message);
    console.error(error);
    res.status(500).json({ error: "Erreur lors de l'enregistrement du like." });
  }
});

router.post('/:id/attend', authenticateToken, async (req, res) => {
  const eventId = parseInt(req.params.id);
  const email = req.user.email;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé." });

    const like = await prisma.like.create({
      data: {
        userId: user.id,
        eventId: eventId,
      },
    });

    res.status(201).json({ message: "Participation enregistrée", like });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ✅ Récupérer les événements likés par l'utilisateur connecté
router.get("/liked", authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    const likedEvents = await prisma.like.findMany({
      where: { userId: user.id },
      include: {
        event: true, // Récupère les infos de l'événement
      },
    });

    const events = likedEvents.map((like) => like.event);

    res.json(events);
  } catch (error) {
    console.error("Erreur récupération likes :", error);
    res.status(500).json({ error: "Erreur récupération événements likés." });
  }
})

module.exports = router;
