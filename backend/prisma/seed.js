const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning database...');
  await prisma.like.deleteMany();
  await prisma.swipe.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  console.log('👤 Creating 60 users...');
  const hashedPassword = await bcrypt.hash('test1234', 10);

  const usersData = [
  { email: "alice@test.com", firstName: "Alice", lastName: "L", lat: 48.8566, lng: 2.3522 },
  { email: "bob@test.com", firstName: "Bob", lastName: "M", lat: 45.7640, lng: 4.8357 },
  { email: "carol@test.com", firstName: "Carol", lastName: "N", lat: 43.2965, lng: 5.3698 },
  { email: "david@test.com", firstName: "David", lastName: "O", lat: 43.6047, lng: 1.4442 },
  { email: "eva@test.com", firstName: "Eva", lastName: "P", lat: 43.7102, lng: 7.2620 },
  { email: "frank@test.com", firstName: "Frank", lastName: "Q", lat: 47.2184, lng: -1.5536 },
  { email: "grace@test.com", firstName: "Grace", lastName: "R", lat: 50.6292, lng: 3.0573 },
  { email: "hugo@test.com", firstName: "Hugo", lastName: "S", lat: 48.5734, lng: 7.7521 },
  { email: "iris@test.com", firstName: "Iris", lastName: "T", lat: 45.1885, lng: 5.7245 },
  { email: "jack@test.com", firstName: "Jack", lastName: "U", lat: 44.8378, lng: -0.5792 },
  { email: "mia@test.com", firstName: "Mia", lastName: "V", lat: 43.6108, lng: 3.8767 },
  { email: "leo@test.com", firstName: "Léo", lastName: "W", lat: 43.9493, lng: 4.8055 },
  { email: "nina@test.com", firstName: "Nina", lastName: "X", lat: 45.7640, lng: 4.8357 },
  { email: "max@test.com", firstName: "Max", lastName: "Y", lat: 48.1173, lng: -1.6778 },
  { email: "zoe@test.com", firstName: "Zoé", lastName: "Z", lat: 47.3220, lng: 5.0415 },
  { email: "lucas@test.com", firstName: "Lucas", lastName: "A", lat: 48.6900, lng: 6.1844 },
  { email: "emma@test.com", firstName: "Emma", lastName: "B", lat: 47.7508, lng: 7.3359 },
  { email: "jules@test.com", firstName: "Jules", lastName: "C", lat: 48.8867, lng: 2.2386 },
  { email: "lea@test.com", firstName: "Léa", lastName: "D", lat: 43.2932, lng: 5.3944 },
  { email: "alex@test.com", firstName: "Alex", lastName: "E", lat: 45.5017, lng: 4.8767 },
  { email: "jade@test.com", firstName: "Jade", lastName: "F", lat: 43.6054, lng: 3.8795 },
  { email: "antoine@test.com", firstName: "Antoine", lastName: "G", lat: 44.0105, lng: 1.3542 },
  { email: "sophie@test.com", firstName: "Sophie", lastName: "H", lat: 45.9000, lng: 6.1167 },
  { email: "theo@test.com", firstName: "Théo", lastName: "I", lat: 49.4431, lng: 1.0993 },
  { email: "lucie@test.com", firstName: "Lucie", lastName: "J", lat: 45.7831, lng: 3.0824 },
  { email: "adam@test.com", firstName: "Adam", lastName: "K", lat: 43.8341, lng: 4.3601 },
  { email: "manon@test.com", firstName: "Manon", lastName: "L", lat: 49.2583, lng: 4.0317 },
  { email: "tom@test.com", firstName: "Tom", lastName: "M", lat: 43.5089, lng: 1.5581 },
  { email: "chloe@test.com", firstName: "Chloé", lastName: "N", lat: 44.1428, lng: 4.8072 },
  { email: "paul@test.com", firstName: "Paul", lastName: "O", lat: 48.3794, lng: -4.4946 },
  { email: "camille@test.com", firstName: "Camille", lastName: "P", lat: 45.9400, lng: 6.4261 },
  { email: "mathis@test.com", firstName: "Mathis", lastName: "Q", lat: 43.9413, lng: 4.8055 },
  { email: "julie@test.com", firstName: "Julie", lastName: "R", lat: 47.4697, lng: -0.5532 },
  { email: "enzo@test.com", firstName: "Enzo", lastName: "S", lat: 45.5165, lng: 3.5277 },
  { email: "anais@test.com", firstName: "Anaïs", lastName: "T", lat: 43.6000, lng: 1.4333 },
  { email: "gabriel@test.com", firstName: "Gabriel", lastName: "U", lat: 48.3000, lng: 4.0833 },
  { email: "laura@test.com", firstName: "Laura", lastName: "V", lat: 47.0833, lng: 2.4000 },
  { email: "noah@test.com", firstName: "Noah", lastName: "W", lat: 45.2833, lng: 5.8833 },
  { email: "clara@test.com", firstName: "Clara", lastName: "X", lat: 46.2000, lng: 6.2667 },
  { email: "ryan@test.com", firstName: "Ryan", lastName: "Y", lat: 45.8667, lng: 6.1000 },
  { email: "sarah@test.com", firstName: "Sarah", lastName: "Z", lat: 46.1167, lng: 3.4167 },
  { email: "nathan@test.com", firstName: "Nathan", lastName: "A", lat: 46.6333, lng: 0.2000 },
  { email: "elisa@test.com", firstName: "Elisa", lastName: "B", lat: 44.2167, lng: 0.6167 },
  { email: "mathilde@test.com", firstName: "Mathilde", lastName: "C", lat: 47.2667, lng: 6.0500 },
  { email: "ethan@test.com", firstName: "Ethan", lastName: "D", lat: 48.5833, lng: 7.7500 },
  { email: "lou@test.com", firstName: "Lou", lastName: "E", lat: 45.3833, lng: 4.7667 },
  { email: "axel@test.com", firstName: "Axel", lastName: "F", lat: 47.2167, lng: -1.5500 },
  { email: "clément@test.com", firstName: "Clément", lastName: "G", lat: 43.7000, lng: 7.2667 },
  { email: "ines@test.com", firstName: "Inès", lastName: "H", lat: 43.3000, lng: 5.4000 },
  { email: "marie@test.com", firstName: "Marie", lastName: "I", lat: 43.6000, lng: 1.4333 }
];

  const danceStyles = [
  "Salsa",
  "Bachata",
  "Kizomba",
  "Rock",
  "Tango",
  "Cha-cha-cha",
  "Valse",
  "Swing",
  "Zouk",
  "Merengue",
  "Forró",
  "Boléro",
  "Reggaeton",
  "Hip-Hop",
  "Dancehall",
  "Afrobeats",
  "Breakdance",
  "Modern Jazz",
  "Classique",
  "Contemporain",
  "West Coast Swing",
  "Charleston",
  "Lindy Hop",
  "Shuffle",
  "Vogue",
  "House Dance"
];
  const levelOptions = ["beginner", "intermediate", "advanced"];
  const createdUsers = [];

  function getRandomSubset(array) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    const count = Math.floor(Math.random() * array.length) + 1; // 1 à array.length
    return shuffled.slice(0, count);
  }

  for (const u of usersData) {
    const dances = getRandomSubset(danceStyles);
    const levels = {};
    dances.forEach((dance) => {
      levels[dance] = levelOptions[Math.floor(Math.random() * levelOptions.length)];
    });

    const createdUser = await prisma.user.create({
      data: {
        email: u.email,
        password: hashedPassword,
        firstName: u.firstName,
        lastName: u.lastName,
        bio: "Description aléatoire",
        location: "France",
        lat: u.lat,
        lng: u.lng,
        dances,
        levels,
        availability: "Week-ends",
        geoLocation: { lat: u.lat, lng: u.lng },
      },
    });
    createdUsers.push(createdUser);
  }

  console.log('📅 Creating 50 events...');

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
  { name: "Montpellier", lat: 43.6108, lng: 3.8767 },
  { name: "Rennes", lat: 48.1173, lng: -1.6778 },
  { name: "Reims", lat: 49.2583, lng: 4.0317 },
  { name: "Le Havre", lat: 49.4944, lng: 0.1079 },
  { name: "Saint-Étienne", lat: 45.4397, lng: 4.3872 },
  { name: "Toulon", lat: 43.1258, lng: 5.9306 },
  { name: "Angers", lat: 47.4784, lng: -0.5632 },
  { name: "Dijon", lat: 47.3220, lng: 5.0415 },
  { name: "Nîmes", lat: 43.8367, lng: 4.3601 },
  { name: "Aix-en-Provence", lat: 43.5297, lng: 5.4474 },
  { name: "Brest", lat: 48.3904, lng: -4.4861 },
  { name: "Limoges", lat: 45.8336, lng: 1.2611 },
  { name: "Tours", lat: 47.3941, lng: 0.6848 },
  { name: "Clermont-Ferrand", lat: 45.7772, lng: 3.0870 },
  { name: "Amiens", lat: 49.8950, lng: 2.3023 },
  { name: "Metz", lat: 49.1193, lng: 6.1757 },
  { name: "Besançon", lat: 47.2379, lng: 6.0241 },
  { name: "Orléans", lat: 47.9029, lng: 1.9093 },
  { name: "Perpignan", lat: 42.6887, lng: 2.8948 },
  { name: "Caen", lat: 49.1829, lng: -0.3700 },
];


  for (let i = 0; i < 50; i++) {
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
