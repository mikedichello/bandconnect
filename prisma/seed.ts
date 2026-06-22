import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function daysFromNow(days: number, hour = 20): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d;
}

const BANDS = [
  {
    email: "band@demo.com",
    pro: true,
    name: "The Night Owls",
    tagline: "Loud, fast & from Brooklyn",
    genre: "Indie, Post-Punk, Shoegaze",
    city: "Brooklyn, NY",
    bio: "Four-piece indie outfit forged in DIY basements. Reverb-soaked guitars, driving rhythms, and choruses built for sweaty rooms. We've shared stages with some of NYC's best and we're always hunting for the next great night.",
    memberCount: 4,
    spotify: "https://open.spotify.com/",
    instagram: "@thenightowls",
    image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400",
    banner: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200",
    theme: "#7c4dff",
  },
  {
    email: "wildhoney@demo.com",
    pro: false,
    name: "Wild Honey",
    tagline: "Sun-soaked psych-folk harmonies",
    genre: "Folk, Americana, Singer-Songwriter",
    city: "Austin, TX",
    bio: "Three-part harmonies and warm analog tones. We make the kind of music best heard on a back porch at golden hour.",
    memberCount: 3,
    instagram: "@wildhoneyband",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400",
  },
  {
    email: "voltage@demo.com",
    pro: false,
    name: "Voltage Theory",
    tagline: "Synthwave for the dancefloor",
    genre: "Electronic, House, Techno",
    city: "Chicago, IL",
    bio: "Analog synths, pulsing basslines, and a light show to match. We turn any room into a late-night warehouse.",
    memberCount: 2,
    image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400",
  },
  {
    email: "ironroots@demo.com",
    pro: false,
    name: "Iron Roots",
    tagline: "Heavy riffs, heavier hearts",
    genre: "Metal, Hardcore, Rock",
    city: "Portland, OR",
    bio: "Crushing live shows since 2019. If your venue has a good PA and a tall stage, we want to fill it.",
    memberCount: 5,
    image: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400",
  },
  {
    email: "blueline@demo.com",
    pro: false,
    name: "Blue Line Quartet",
    tagline: "Modern jazz, classic soul",
    genre: "Jazz, Soul, Funk",
    city: "New Orleans, LA",
    bio: "A working quartet steeped in the NOLA tradition with a contemporary edge. Perfect for listening rooms and late sets.",
    memberCount: 4,
    image: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400",
  },
  {
    email: "paperplanes@demo.com",
    pro: false,
    name: "Paper Planes",
    tagline: "Dreamy bedroom pop",
    genre: "Pop, Indie, Bedroom Pop",
    city: "Seattle, WA",
    bio: "Hazy melodies and honest lyrics. We started in a bedroom and we're ready for the stage.",
    memberCount: 3,
    image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400",
  },
];

const VENUES = [
  {
    email: "venue@demo.com",
    pro: true,
    name: "The Underground",
    tagline: "200-cap room in the heart of downtown",
    genresWanted: "Indie, Punk, Rock, Post-Punk",
    city: "Brooklyn, NY",
    address: "88 Wythe Ave, Brooklyn, NY",
    capacity: 200,
    description: "A storied basement venue with a killer sound system and a fiercely loyal crowd. We book 5 nights a week across indie, punk, and everything loud. Load-in is easy, the green room is real, and we pay fair.",
    instagram: "@undergroundbk",
    image: "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=400",
    banner: "https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=1200",
    theme: "#ff5da2",
  },
  {
    email: "echolounge@demo.com",
    pro: false,
    name: "Echo Lounge",
    tagline: "Intimate listening room & cocktail bar",
    genresWanted: "Jazz, Soul, Folk, Singer-Songwriter",
    city: "Austin, TX",
    address: "210 E 6th St, Austin, TX",
    capacity: 120,
    description: "Seated listening room with a grand piano and a great wine list. Ideal for songwriters and jazz combos.",
    image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=400",
  },
  {
    email: "warehouse9@demo.com",
    pro: false,
    name: "Warehouse 9",
    tagline: "Raw industrial space for big nights",
    genresWanted: "Electronic, House, Techno, Experimental",
    city: "Chicago, IL",
    address: "9 N Green St, Chicago, IL",
    capacity: 500,
    description: "A converted warehouse with a monster sound system and room to move. We run electronic and experimental nights until late.",
    image: "https://images.unsplash.com/photo-1545128485-c400e7702796?w=400",
  },
  {
    email: "thecorner@demo.com",
    pro: false,
    name: "The Corner Tavern",
    tagline: "Neighborhood bar with a stage",
    genresWanted: "Rock, Americana, Country, Blues",
    city: "Portland, OR",
    address: "1420 SE Division St, Portland, OR",
    capacity: 90,
    description: "A no-frills neighborhood bar that loves live music. Friendly crowd, cold beer, and a stage that's seen it all.",
    image: "https://images.unsplash.com/photo-1538488881038-e252a119ace7?w=400",
  },
  {
    email: "rivertheater@demo.com",
    pro: false,
    name: "River Theater",
    tagline: "Historic 400-cap concert hall",
    genresWanted: "Indie, Pop, Folk, Rock",
    city: "Seattle, WA",
    address: "55 Riverfront Way, Seattle, WA",
    capacity: 400,
    description: "A beautifully restored theater with tiered seating and pro production. We host touring acts and special local bills.",
    image: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=400",
  },
];

async function main() {
  console.log("🌱 Seeding BandConnect…");

  // Clean slate (dev only).
  await prisma.message.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.event.deleteMany();
  await prisma.bandProfile.deleteMany();
  await prisma.venueProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 12);

  const bandUsers: Record<string, { userId: string; profileId: string }> = {};
  for (const b of BANDS) {
    const user = await prisma.user.create({
      data: {
        email: b.email,
        passwordHash,
        role: "BAND",
        plan: b.pro ? "PRO" : "FREE",
        planStatus: b.pro ? "active" : null,
        bandProfile: {
          create: {
            name: b.name,
            slug: slugify(b.name),
            tagline: b.tagline,
            bio: b.bio,
            genre: b.genre,
            city: b.city,
            memberCount: b.memberCount,
            imageUrl: b.image,
            bannerUrl: b.banner ?? null,
            instagram: b.instagram ?? null,
            spotify: b.spotify ?? null,
            themeColor: b.theme ?? "#7c4dff",
            featured: Boolean(b.pro),
            lookingForGigs: true,
          },
        },
      },
      include: { bandProfile: true },
    });
    bandUsers[b.email] = { userId: user.id, profileId: user.bandProfile!.id };
  }

  const venueUsers: Record<string, { userId: string; profileId: string }> = {};
  for (const v of VENUES) {
    const user = await prisma.user.create({
      data: {
        email: v.email,
        passwordHash,
        role: "VENUE",
        plan: v.pro ? "PRO" : "FREE",
        planStatus: v.pro ? "active" : null,
        venueProfile: {
          create: {
            name: v.name,
            slug: slugify(v.name),
            tagline: v.tagline,
            description: v.description,
            genresWanted: v.genresWanted,
            city: v.city,
            address: v.address,
            capacity: v.capacity,
            imageUrl: v.image,
            bannerUrl: v.banner ?? null,
            instagram: v.instagram ?? null,
            themeColor: v.theme ?? "#7c4dff",
            featured: Boolean(v.pro),
            acceptingSubmissions: true,
          },
        },
      },
      include: { venueProfile: true },
    });
    venueUsers[v.email] = { userId: user.id, profileId: user.venueProfile!.id };
  }

  // Shows
  const owls = bandUsers["band@demo.com"];
  const underground = venueUsers["venue@demo.com"];
  const echo = venueUsers["echolounge@demo.com"];
  const honey = bandUsers["wildhoney@demo.com"];

  await prisma.event.createMany({
    data: [
      {
        ownerId: underground.userId,
        venueProfileId: underground.profileId,
        title: "Friday Night Live: The Night Owls + guests",
        description: "Doors 8pm · $12 · 21+",
        date: daysFromNow(7),
        city: "Brooklyn, NY",
        venueName: "The Underground",
        bandName: "The Night Owls",
        ticketUrl: "https://example.com/tickets",
      },
      {
        ownerId: underground.userId,
        venueProfileId: underground.profileId,
        title: "Punk Night: 4-band local bill",
        description: "Doors 7pm · $10",
        date: daysFromNow(14),
        city: "Brooklyn, NY",
        venueName: "The Underground",
      },
      {
        ownerId: owls.userId,
        bandProfileId: owls.profileId,
        title: "The Night Owls at The Underground",
        date: daysFromNow(7),
        city: "Brooklyn, NY",
        venueName: "The Underground",
        ticketUrl: "https://example.com/tickets",
      },
      {
        ownerId: echo.userId,
        venueProfileId: echo.profileId,
        title: "Sunday Sessions: Wild Honey",
        description: "Seated show · 7pm",
        date: daysFromNow(10),
        city: "Austin, TX",
        venueName: "Echo Lounge",
        bandName: "Wild Honey",
      },
      {
        ownerId: honey.userId,
        bandProfileId: honey.profileId,
        title: "Wild Honey — Sunday Sessions",
        date: daysFromNow(10),
        city: "Austin, TX",
        venueName: "Echo Lounge",
      },
    ],
  });

  // Submissions (band -> venue)
  await prisma.submission.create({
    data: {
      bandProfileId: honey.profileId,
      venueProfileId: underground.profileId,
      subject: "Austin folk trio touring through NYC in the fall",
      message:
        "Hi! We're Wild Honey, a folk trio from Austin heading east this fall. We draw 60–100 in our home market and have a clean live set. Would love to play a weeknight at The Underground. Links in our profile — thanks for considering!",
      proposedDate: daysFromNow(45),
      status: "PENDING",
    },
  });

  await prisma.submission.create({
    data: {
      bandProfileId: bandUsers["voltage@demo.com"].profileId,
      venueProfileId: venueUsers["warehouse9@demo.com"].profileId,
      subject: "Synthwave duo for a late night",
      message:
        "We're Voltage Theory out of Chicago — analog synthwave with a full light rig. Perfect fit for a Warehouse 9 late set. Available most Fridays. Let's make something loud happen.",
      status: "ACCEPTED",
    },
  });

  // Messages between demo band and demo venue
  const convo = [
    { from: underground.userId, to: owls.userId, body: "Hey! Loved your set at the showcase. Want to talk about that Friday slot?" },
    { from: owls.userId, to: underground.userId, body: "Absolutely — we're in. The 7th works great for us. What's load-in look like?" },
    { from: underground.userId, to: owls.userId, body: "Load-in at 5, soundcheck 6:30, doors at 8. We'll put you on the poster this week." },
  ];
  let offset = 0;
  for (const m of convo) {
    await prisma.message.create({
      data: {
        senderId: m.from,
        recipientId: m.to,
        body: m.body,
        createdAt: new Date(Date.now() - (convo.length - offset) * 3600_000),
        readAt: offset < 2 ? new Date() : null,
      },
    });
    offset += 1;
  }

  console.log(`✅ Seeded ${BANDS.length} bands, ${VENUES.length} venues, shows, submissions & messages.`);
  console.log("   Demo logins (password: password123):");
  console.log("   • band@demo.com  (Pro band)");
  console.log("   • venue@demo.com (Pro venue)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
