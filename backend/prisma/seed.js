const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Suppression des anciennes données...");
  await prisma.like.deleteMany();
  await prisma.swipe.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  console.log("👤 Création de 10 utilisateurs fixes...");
  const hashedPassword = await bcrypt.hash('test1234', 10);

  const usersData = [
    { email: "alice@test.com", firstName: "Alice", lat: 48.8566, lng: 2.3522 },
    { email: "bob@test.com", firstName: "Bob", lat: 45.75, lng: 4.85 },
    { email: "carol@test.com", firstName: "Carol", lat: 43.6047, lng: 1.4442 },
    { email: "david@test.com", firstName: "David", lat: 44.8378, lng: -0.5792 },
    { email: "eva@test.com", firstName: "Eva", lat: 43.2965, lng: 5.3698 },
    { email: "frank@test.com", firstName: "Frank", lat: 47.2184, lng: -1.5536 },
    { email: "grace@test.com", firstName: "Grace", lat: 43.7102, lng: 7.2620 },
    { email: "hugo@test.com", firstName: "Hugo", lat: 50.6292, lng: 3.0573 },
    { email: "iris@test.com", firstName: "Iris", lat: 48.5734, lng: 7.7521 },
    { email: "jack@test.com", firstName: "Jack", lat: 45.1885, lng: 5.7245 },
  ];

  const users = [];

  for (const userData of usersData) {
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        firstName: userData.firstName,
        lastName: "Test",
        password: hashedPassword,
        bio: "Utilisateur généré automatiquement",
        location: "France",
        lat: userData.lat,
        lng: userData.lng,
        dances: ["salsa", "kizomba"],
        levels: {
          salsa: "beginner",
          kizomba: "intermediate",
        },
        geoLocation: {
          lat: userData.lat,
          lng: userData.lng,
        },
      },
    });
    users.push(user);
  }

  // Utilisateur de test complet
  const testUser = await prisma.user.create({
    data: {
      email: "testuser@test.com",
      firstName: "Test",
      lastName: "User",
      password: hashedPassword,
      lat: 48.85,
      lng: 2.35,
      dances: ["salsa", "bachata"],
      levels: {
        salsa: "advanced",
        bachata: "intermediate",
      },
      availability: "Soirs de semaine et week-ends",
      bio: "Je danse depuis 10 ans et adore la salsa !",
      location: "Paris",
      geoLocation: { lat: 48.85, lng: 2.35 },
    },
  });
  users.push(testUser);

  console.log("📍 Création d'événements fixes avec organisateurs...");
  const sampleEvents = [
    {
      name: "Soirée Salsa à Lyon",
      lat: 45.75,
      lng: 4.85,
      date: new Date("2025-07-10"),
      description: "Ambiance caliente et DJ latino 🎶",
      organizerId: users[0].id,
    },
    {
      name: "West Coast à Toulouse",
      lat: 43.6,
      lng: 1.44,
      date: new Date("2025-07-14"),
      description: "Niveau débutant à confirmé 🕺",
      organizerId: users[1].id,
    },
    {
      name: "Bal Tango à Nantes",
      lat: 47.22,
      lng: -1.55,
      date: new Date("2025-07-18"),
      description: "Milonga en plein air 💃",
      organizerId: users[2].id,
    },
    {
      name: "Kompa sur la plage à Quiberon",
      lat: 47.4833,
      lng: -3.1167,
      date: new Date("2025-07-22"),
      description: "Kompa sunset vibes au bord de la mer 🌅",
      organizerId: users[3].id,
    },
    {
      name: "Kizomba à Vannes",
      lat: 47.6559,
      lng: -2.7603,
      date: new Date("2025-07-25"),
      description: "Soirée kizomba avec DJ en direct 🎧",
      organizerId: users[4].id,
    },
  ];

  for (const event of sampleEvents) {
    await prisma.event.create({ data: event });
  }

  console.log("🗺️ Génération de 100 événements aléatoires en France...");
  for (let i = 1; i <= 100; i++) {
    const randomLat = 42 + Math.random() * 9;
    const randomLng = -5 + Math.random() * 13;
    const organizer = users[Math.floor(Math.random() * users.length)];

    await prisma.event.create({
      data: {
        name: `Événement #${i}`,
        lat: parseFloat(randomLat.toFixed(5)),
        lng: parseFloat(randomLng.toFixed(5)),
        date: new Date(Date.now() + i * 86400000),
        description: `Événement auto-généré n°${i} en France 🇫🇷`,
        organizerId: organizer.id,
      },
    });
  }

  console.log("🤝 Insertion de swipes entre les 3 premiers utilisateurs...");
  await prisma.swipe.createMany({
    data: [
      { swiperId: users[0].id, swipedId: users[1].id, liked: true },
      { swiperId: users[1].id, swipedId: users[0].id, liked: false },
      { swiperId: users[0].id, swipedId: users[2].id, liked: true },
      { swiperId: users[2].id, swipedId: users[0].id, liked: true },
    ],
  });

  console.log(`✅ Seed terminé : ${users.length} utilisateurs, 105 événements, 4 swipes.`);
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
