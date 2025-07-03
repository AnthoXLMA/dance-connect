const express = require("express");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { authenticateToken, authenticateTokenOptional, generateToken } = require("../middlewares/auth");


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
        firstName: "",
        lastName: "",
        bio: "",
        location: "",
        dances: [],
        levels: {},
        availability: null,
        geoLocation: null,
        lat: null,
        lng: null,
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
        lastName: true,
        email: true,
        bio: true,
        location: true,
        dances: true,
        levels: true,
        availability: true,
        geoLocation: true,
        lat: true,
        lng: true,
        username: true,
        avatarUrl: true,
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
  console.log("✅ [GET] /me hit par :", req.user);
  const userId = req.user.id;
  const {
    firstName,
    lastName,
    lat,
    lng,
    availability,
    bio,
    dances,
    levels,
    location,
    geoLocation,
    username,
    avatarUrl,
  } = req.body;

  // 🧼 Nettoyage de `dances` : uniquement chaînes non vides
  const cleanedDances = Array.isArray(dances)
    ? dances.filter(d => typeof d === 'string' && d.trim() !== '')
    : undefined;

  // 🧼 Nettoyage de `levels` : uniquement paires valides { clé: valeur non-nulle }
  const cleanedLevels = levels && typeof levels === 'object'
    ? Object.fromEntries(
        Object.entries(levels).filter(
          ([k, v]) => k && k !== 'undefined' && v != null
        )
      )
    : undefined;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(lat !== undefined && { lat }),
        ...(lng !== undefined && { lng }),
        ...(availability !== undefined && { availability }),
        ...(bio !== undefined && { bio }),
        ...(cleanedDances !== undefined && { dances: cleanedDances }),
        ...(cleanedLevels !== undefined && { levels: cleanedLevels }),
        ...(location !== undefined && { location }),
        ...(geoLocation !== undefined && { geoLocation }),
        ...(username !== undefined && { username }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil :", error);
    res.status(500).json({ error: "Erreur lors de la mise à jour du profil." });
  }
});


// // 📍 Affichage de tous les utilisateurs avec coordonnées valides
// router.get("/nearby", async (req, res) => {
//     console.log("✅ [GET] /nearby triggered");

//   try {
//     const users = await prisma.user.findMany({
//       where: {
//         lat: { not: null },
//         lng: { not: null },
//       },
//     });

//     const filteredUsers = users.filter((u) => u.lat !== null && u.lng !== null);

//     console.log("Tous les utilisateurs avec coordonnées valides :", filteredUsers.length);

//     res.json(
//       filteredUsers.map((u) => ({
//         id: u.id,
//         firstName: u.firstName,
//         lastName: u.lastName,
//         lat: u.lat,
//         lng: u.lng,
//         dances: u.dances,
//         avatarUrl: u.avatarUrl,
//         availability: u.availability,
//         bio: u.bio,
//         levels: u.levels,
//         location: u.location,
//         username: u.username,
//       }))
//     );
//   } catch (error) {
//     console.error("Erreur dans /api/users/nearby :", error);
//     res.status(500).json({ error: "Erreur serveur" });
//   }
// });

// router.get("/nearby", authenticateToken, async (req, res) => {
//   const userId = req.user.id;

//   try {
//     // Récupère les IDs des utilisateurs déjà swipés
//     const swipes = await prisma.swipe.findMany({
//       where: { swiperId: userId },
//       select: { swipedId: true },
//     });
//     const swipedIds = swipes.map(s => s.swipedId);

//     // Trouve les utilisateurs géolocalisés non encore swipés
//     const users = await prisma.user.findMany({
//       where: {
//         id: {
//           not: userId,
//           notIn: swipedIds,
//         },
//         lat: { not: null },
//         lng: { not: null },
//       },
//     });

//     res.json(users.map(u => ({
//       id: u.id,
//       firstName: u.firstName,
//       lastName: u.lastName,
//       lat: u.lat,
//       lng: u.lng,
//       dances: u.dances,
//       avatarUrl: u.avatarUrl,
//       availability: u.availability,
//       bio: u.bio,
//       levels: u.levels,
//       location: u.location,
//       username: u.username,
//     })));
//   } catch (error) {
//     console.error("Erreur dans /api/users/nearby :", error);
//     res.status(500).json({ error: "Erreur serveur" });
//   }
// });

//DEUX ROUTES NEARBY CI DESSUS FUSIONNEES
router.get("/nearby", authenticateTokenOptional, async (req, res) => {
  try {
    let userId = null;
    if (req.user) {
      userId = req.user.id;
    }

    let swipedIds = [];

    if (userId) {
      // Récupère les IDs des utilisateurs déjà swipés (si connecté)
      const swipes = await prisma.swipe.findMany({
        where: { swiperId: userId },
        select: { swipedId: true },
      });
      swipedIds = swipes.map((s) => s.swipedId);
    }

    // Recherche des utilisateurs avec coordonnées valides
    // Si connecté, exclure soi-même + les swipés
    const users = await prisma.user.findMany({
      where: {
        lat: { not: null },
        lng: { not: null },
        ...(userId ? { id: { not: userId, notIn: swipedIds } } : {}),
      },
    });

    const result = users.map((u) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      lat: u.lat,
      lng: u.lng,
      dances: u.dances,
      avatarUrl: u.avatarUrl,
      availability: u.availability,
      bio: u.bio,
      levels: u.levels,
      location: u.location,
      username: u.username,
    }));

    res.json(result);
  } catch (error) {
    console.error("Erreur dans /api/users/nearby :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


module.exports = router;
