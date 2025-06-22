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
        firstName: "",  // ajoute ces champs ici pour éviter erreur si dans Prisma ils sont obligatoires
        lastName: "",
        bio: "",
        location: "",
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

// ✏️ Mise à jour du profil utilisateur connecté
router.put("/me", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  // ⚠️ On extrait uniquement les champs autorisés à être modifiés
  const {
    firstName,
    lat,
    lng,
    availability,
    bio,
    dances,
    levels,
    location,
    geoLocation,
  } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lat !== undefined && { lat }),
        ...(lng !== undefined && { lng }),
        ...(availability !== undefined && { availability }),
        ...(bio !== undefined && { bio }),
        ...(dances !== undefined && { dances }),
        ...(levels !== undefined && { levels }),
        ...(location !== undefined && { location }),
        ...(geoLocation !== undefined && { geoLocation }),
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil :", error);
    res.status(500).json({ error: "Erreur lors de la mise à jour du profil." });
  }
});

// GET /api/users/nearby?lat=...&lng=...&radius=...
router.get("/nearby", authenticateToken, async (req, res) => {
  const { lat, lng, radius = 10 } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: "lat et lng sont requis en query params" });
  }

  // Pour simplifier, on récupère tous les utilisateurs dans un rayon "radius" km.
  // Attention: ceci est un calcul approximatif, pour des requêtes précises il faut utiliser PostGIS ou autre.
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  const radiusNum = parseFloat(radius);

  try {
    // Récupérer tous les utilisateurs (sauf soi-même)
    const users = await prisma.user.findMany({
      where: {
        id: { not: req.user.id }, // exclure l’utilisateur connecté
        lat: { not: null },
        lng: { not: null },
      },
      select: {
        id: true,
        firstName: true,
        lat: true,
        lng: true,
        bio: true,
        dances: true,
        levels: true,
      },
    });

    // Fonction simple de distance entre 2 points GPS en km (Haversine)
    function distanceKm(lat1, lng1, lat2, lng2) {
      const R = 6371; // rayon Terre en km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLng = ((lng2 - lng1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLng / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }

    // Filtrer les utilisateurs dans le rayon
    const nearbyUsers = users.filter((u) => {
      return distanceKm(latNum, lngNum, u.lat, u.lng) <= radiusNum;
    });

    res.json(nearbyUsers);
  } catch (error) {
    console.error("Erreur dans /api/users/nearby :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


module.exports = router;
