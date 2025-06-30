const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning database...');
  await prisma.like.deleteMany();
  await prisma.swipe.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  console.log('👤 Creating 10 users...');
  const hashedPassword = await bcrypt.hash('test1234', 10);

  const usersData = [
    { email: "alice@test.com", firstName: "Alice", lastName: "L", lat: 48.8566, lng: 2.3522 },   // Paris
    { email: "bob@test.com", firstName: "Bob", lastName: "M", lat: 45.7640, lng: 4.8357 },       // Lyon
    { email: "carol@test.com", firstName: "Carol", lastName: "N", lat: 43.2965, lng: 5.3698 },   // Marseille
    { email: "david@test.com", firstName: "David", lastName: "O", lat: 43.6047, lng: 1.4442 },   // Toulouse
    { email: "eva@test.com", firstName: "Eva", lastName: "P", lat: 43.7102, lng: 7.2620 },       // Nice
    { email: "frank@test.com", firstName: "Frank", lastName: "Q", lat: 47.2184, lng: -1.5536 },  // Nantes
    { email: "grace@test.com", firstName: "Grace", lastName: "R", lat: 50.6292, lng: 3.0573 },   // Lille
    { email: "hugo@test.com", firstName: "Hugo", lastName: "S", lat: 48.5734, lng: 7.7521 },     // Strasbourg
    { email: "iris@test.com", firstName: "Iris", lastName: "T", lat: 45.1885, lng: 5.7245 },     // Grenoble
    { email: "jack@test.com", firstName: "Jack", lastName: "U", lat: 44.8378, lng: -0.5792 },    // Bordeaux
  ];

  const createdUsers = [];

  for (const u of usersData) {
    const createdUser = await prisma.user.create({
      data: {
        email: u.email,
        password: hashedPassword,
        firstName: u.firstName,
        lastName: u.lastName,
        bio: "Utilisateur seed",
        location: "France",
        lat: u.lat,
        lng: u.lng,
        dances: ["salsa", "bachata"],
        levels: { salsa: "beginner", bachata: "intermediate" },
        availability: "Week-ends",
        geoLocation: { lat: u.lat, lng: u.lng },
      },
    });
    createdUsers.push(createdUser);
  }

  console.log('📅 Creating 20 events...');

  const cities = [
    { name: "Paris", lat: 48.8566, lng: 2.3522 },
    { name: "Lyon", lat: 45.7640, lng: 4.8357 },
    { name: "Marseille", lat: 43.2965, lng: 5.3698 },
    { name: "Toulouse", lat: 43.6047, lng: 1.4442 },
    { name: "Nice", lat: 43.7102, lng: 7.2620 },
    { name: "Nantes", lat: 47.2184, lng: -1.5536 },
    { name: "Lille", lat: 50.6292, lng: 3.0573 },
    { name: "Strasbourg", lat: 48.5734, lng: 7.7521 },
    { name: "Grenoble", lat: 45.1885, lng: 5.7245 },
    { name: "Bordeaux", lat: 44.8378, lng: -0.5792 },
  ];

  const danceStyles = ["salsa", "bachata", "kizomba", "rock", "swing"];

  for (let i = 0; i < 20; i++) {
    const city = cities[i % cities.length];
    const randomDances = [danceStyles[i % danceStyles.length]];
    const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];

    await prisma.event.create({
      data: {
        name: `Événement ${i + 1} à ${city.name}`,
        // description: `Venez danser à ${city.name} !`,
        lat: city.lat + (Math.random() - 0.5) * 0.05,
        lng: city.lng + (Math.random() - 0.5) * 0.05,
        date: new Date(Date.now() + i * 86400000), // dans les 20 prochains jours
        dances: randomDances,
        organizerId: randomUser.id,
      },
    });
  }

  console.log('✅ Seed done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
