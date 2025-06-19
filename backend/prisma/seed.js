const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Suppression des anciennes données...");
  await prisma.like.deleteMany();
  await prisma.swipe.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  console.log("👤 Création des utilisateurs...");
  const users = await Promise.all([
    prisma.user.create({
      data: { email: 'alice@example.com', password: 'hashedpassword', firstName: 'Alice' },
    }),
    prisma.user.create({
      data: { email: 'bob@example.com', password: 'hashedpassword', firstName: 'Bob' },
    }),
    prisma.user.create({
      data: { email: 'carol@example.com', password: 'hashedpassword', firstName: 'Carol' },
    }),
  ]);

  console.log("📍 Création d'événements fixes...");
  const sampleEvents = [
    {
      name: "Soirée Salsa à Lyon",
      lat: 45.75,
      lng: 4.85,
      date: new Date("2025-07-10"),
      description: "Ambiance caliente et DJ latino 🎶",
    },
    {
      name: "West Coast à Toulouse",
      lat: 43.6,
      lng: 1.44,
      date: new Date("2025-07-14"),
      description: "Niveau débutant à confirmé 🕺",
    },
    {
      name: "Bal Tango à Nantes",
      lat: 47.22,
      lng: -1.55,
      date: new Date("2025-07-18"),
      description: "Milonga en plein air 💃",
    },
    {
      name: "Kompa sur la plage à Quiberon",
      lat: 47.4833,
      lng: -3.1167,
      date: new Date("2025-07-22"),
      description: "Kompa sunset vibes au bord de la mer 🌅",
    },
    {
      name: "Kizomba à Vannes",
      lat: 47.6559,
      lng: -2.7603,
      date: new Date("2025-07-25"),
      description: "Soirée kizomba avec DJ en direct 🎧",
    },
  ];

  for (const event of sampleEvents) {
    await prisma.event.create({
      data: event,
    });
  }

  console.log("🗺️ Génération de 100 événements aléatoires en France...");
  for (let i = 1; i <= 100; i++) {
    const randomLat = 42 + Math.random() * 9;  // entre 42 et 51
    const randomLng = -5 + Math.random() * 13; // entre -5 et 8

    await prisma.event.create({
      data: {
        name: `Événement #${i}`,
        lat: parseFloat(randomLat.toFixed(5)),
        lng: parseFloat(randomLng.toFixed(5)),
        date: new Date(Date.now() + i * 86400000), // 1 par jour
        description: `Événement auto-généré n°${i} en France 🇫🇷`,
      },
    });
  }

  console.log("🤝 Insertion de swipes...");
  await prisma.swipe.createMany({
    data: [
      { swiperId: users[0].id, swipedId: users[1].id, liked: true },
      { swiperId: users[1].id, swipedId: users[0].id, liked: false },
      { swiperId: users[0].id, swipedId: users[2].id, liked: true },
      { swiperId: users[2].id, swipedId: users[0].id, liked: true },
    ],
  });

  console.log("✅ Seed terminé : 3 users, 105 événements, 4 swipes.");
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
