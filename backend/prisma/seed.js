const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


async function main() {
  // Supprimer les anciens événements
  await prisma.like.deleteMany();
  await prisma.event.deleteMany();

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

  // Générer des événements supplémentaires (45 de plus)
  const cities = [
    { name: "Paris", lat: 48.8566, lng: 2.3522 },
    { name: "Marseille", lat: 43.2965, lng: 5.3698 },
    { name: "Bordeaux", lat: 44.8378, lng: -0.5792 },
    { name: "Montpellier", lat: 43.6108, lng: 3.8767 },
    { name: "Nice", lat: 43.7102, lng: 7.2620 },
    { name: "Strasbourg", lat: 48.5734, lng: 7.7521 },
    { name: "Lille", lat: 50.6292, lng: 3.0573 },
    { name: "Rennes", lat: 48.1173, lng: -1.6778 },
    { name: "Grenoble", lat: 45.1885, lng: 5.7245 },
    { name: "Dijon", lat: 47.3220, lng: 5.0415 },
  ];

  const danceStyles = [
    "Salsa",
    "West Coast Swing",
    "Tango",
    "Kompa",
    "Kizomba",
    "Bachata",
    "Zouk",
    "Lindy Hop",
    "Charleston",
    "Hip Hop",
  ];

  const descriptions = [
    "Ambiance festive et conviviale 🎉",
    "Cours pour tous les niveaux 🕺",
    "DJ live avec sons entraînants 🎧",
    "Soirée sous les étoiles ✨",
    "Bar ouvert toute la nuit 🍸",
    "Compétition amicale entre danseurs 🏆",
    "Venez découvrir cette danse magnifique 💃",
    "Ambiance chaleureuse et accueillante 🤗",
    "Entrée gratuite avant 22h 🕙",
    "Lieu mythique de la ville 🏛️",
  ];

  // Commencer à l'id 306 pour éviter conflit avec tes 5 événements
  let idCounter = 306;

  for (let i = 0; i < 45; i++) {
    const city = cities[i % cities.length];
    const dance = danceStyles[i % danceStyles.length];
    const desc = descriptions[i % descriptions.length];
    const date = new Date(2025, 6, 26 + i); // juillet 26 + i jours

    sampleEvents.push({
      name: `${dance} à ${city.name}`,
      lat: city.lat + (Math.random() - 0.5) * 0.02, // petit offset aléatoire pour réalisme
      lng: city.lng + (Math.random() - 0.5) * 0.02,
      date,
      description: desc,
    });
    idCounter++;
  }

  // Insert events dans la DB
  for (const event of sampleEvents) {
    await prisma.event.upsert({
      where: { name: event.name },
      update: {},
      create: {
        name: event.name,
        lat: event.lat,
        lng: event.lng,
        date: event.date,
        description: event.description,
      },
    });
  }

  console.log(`✅ ${sampleEvents.length} événements insérés/mis à jour.`);
}

main()
  .catch(e => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


await prisma.event.createMany({
  data: sampleEvents,
});


  console.log("✅ Événements seedés !");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
