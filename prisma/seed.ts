import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Inlined helpers (kept dependency-free so `tsx` needs no path-alias config).
function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/['"]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
const COORDS: Record<string, [number, number]> = {
  "New Haven": [41.3083, -72.9279], Hartford: [41.7637, -72.6851], Hamden: [41.3959, -72.8968],
  Bridgeport: [41.1792, -73.1894], Stamford: [41.0534, -73.5387], "New London": [41.3557, -72.0995],
  Norwich: [41.5243, -72.0759], Middletown: [41.5623, -72.6506], Willimantic: [41.7106, -72.2079],
  Fairfield: [41.1408, -73.2613], Mystic: [41.3543, -71.9665], Bristol: [41.6718, -72.9493],
  Westport: [41.1415, -73.3579], Torrington: [41.8007, -73.1212],
};
function coords(town: string): { lat: number; lng: number } | null {
  const c = COORDS[town];
  return c ? { lat: c[0], lng: c[1] } : null;
}
function daysFromNow(d: number, h = 20): Date {
  const x = new Date();
  x.setDate(x.getDate() + d);
  x.setHours(h, 0, 0, 0);
  return x;
}

async function main() {
  console.log("🌱 Seeding BandConnect (CT live-music edition)…");

  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.rsvp.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.availabilityDate.deleteMany();
  await prisma.mediaItem.deleteMany();
  await prisma.event.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  const pw = await bcrypt.hash("password123", 12);

  async function make(opts: {
    email: string; type: string; name: string; pro?: boolean;
    data?: Record<string, unknown>;
  }) {
    const c = coords((opts.data?.city as string) ?? "");
    const user = await prisma.user.create({
      data: {
        email: opts.email, passwordHash: pw, role: opts.type,
        plan: opts.pro ? "PRO" : "FREE", planStatus: opts.pro ? "active" : null,
        profile: {
          create: {
            type: opts.type, displayName: opts.name, slug: slugify(opts.name),
            featured: Boolean(opts.pro), lat: c?.lat ?? null, lng: c?.lng ?? null,
            ...opts.data,
          },
        },
      },
      include: { profile: true },
    });
    return user.profile!;
  }

  // --- Venues ---
  const space = await make({ email: "venue@demo.com", type: "VENUE", name: "The Space Ballroom", pro: true, data: {
    city: "Hamden", zip: "06514", address: "295 Treadwell St, Hamden, CT", tagline: "All-ages room for the CT scene",
    bio: "A beloved all-ages venue in Hamden with a great PA and an even better crowd. We book indie, punk, emo, and everything in between, six nights a week.",
    genres: "Indie, Punk, Emo, Rock, Folk", instagram: "@thespacect", websiteUrl: "https://example.com", themeColor: "#ff5da2",
    avatarUrl: "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=400",
    bannerUrl: "https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=1200",
  }});
  const cafenine = await make({ email: "cafenine@demo.com", type: "VENUE", name: "Cafe Nine", data: {
    city: "New Haven", zip: "06510", address: "250 State St, New Haven, CT", tagline: "The Musician's Living Room",
    bio: "A tiny corner club in New Haven with a huge musical heart. Jazz, blues, rock, and songwriter nights.",
    genres: "Jazz, Blues, Rock, Singer-Songwriter", avatarUrl: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=400",
  }});
  const stillriver = await make({ email: "stillriver@demo.com", type: "VENUE", name: "Still River Tavern", data: {
    city: "Bristol", zip: "06010", tagline: "Cold beer, loud bands",
    bio: "Neighborhood tavern with live music every weekend. Family-friendly early sets, rowdy late ones.",
    genres: "Rock, Country, Americana, Blues",
  }});
  const sidecar = await make({ email: "sidecar@demo.com", type: "VENUE", name: "Sidecar Stage", data: {
    city: "Mystic", zip: "06355", tagline: "Coastal listening room", bio: "Intimate seated room on the Mystic waterfront.",
    genres: "Folk, Acoustic, Jazz, Singer-Songwriter",
  }});

  // --- Bands ---
  const owls = await make({ email: "band@demo.com", type: "BAND", name: "The Night Owls", pro: true, data: {
    city: "New Haven", zip: "06511", tagline: "Loud, fast & from New Haven",
    bio: "Four-piece indie outfit forged in CT basements. Reverb-soaked guitars and choruses built for sweaty rooms.",
    genres: "Indie, Post-Punk, Shoegaze", availableForGigs: true, rateMin: 300, rateMax: 600, needsMusicians: false,
    instagram: "@thenightowls", spotify: "https://open.spotify.com/", themeColor: "#7c4dff",
    avatarUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400",
    bannerUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200",
  }});
  const harbor = await make({ email: "harbor@demo.com", type: "BAND", name: "Harbor Lights", data: {
    city: "Mystic", tagline: "Coastal folk-rock", bio: "Harmony-driven folk rock from the CT shoreline.",
    genres: "Folk, Americana, Rock", availableForGigs: true, rateMin: 250, rateMax: 450, needsMusicians: true,
  }});
  const brassworks = await make({ email: "brass@demo.com", type: "BAND", name: "Brassworks Collective", data: {
    city: "Hartford", tagline: "9-piece funk & soul machine", bio: "Horn-fueled funk and soul that fills the floor.",
    genres: "Funk, Soul, R&B", availableForGigs: true, rateMin: 800, rateMax: 1500, rateHidden: true,
  }});

  // --- Musicians ---
  const mara = await make({ email: "musician@demo.com", type: "MUSICIAN", name: "Mara Quinn", pro: true, data: {
    city: "New Haven", zip: "06511", tagline: "Singer-songwriter & multi-instrumentalist",
    bio: "Touring-caliber songwriter based in New Haven. Solo sets, fill-in work, and looking to start something new.",
    genres: "Folk, Indie, Singer-Songwriter", instruments: "Vocals, Guitar, Keys/Piano",
    availableForGigs: true, rateMin: 150, rateMax: 300, isSolo: true, wantsStartBand: true, openForFillIns: true,
    instagram: "@maraquinnmusic", spotify: "https://open.spotify.com/", themeColor: "#22d3a5",
    avatarUrl: "https://images.unsplash.com/photo-1525186402429-b4ff38bedec6?w=400",
  }});
  const dev = await make({ email: "dev@demo.com", type: "MUSICIAN", name: "Devon Park", data: {
    city: "Hartford", tagline: "Drummer for hire", bio: "Pocket drummer. Reliable, fast learner, full kit + transport.",
    instruments: "Drums, Percussion", genres: "Rock, Funk, Jazz", availableForGigs: true, rateMin: 120, rateMax: 250,
    openForFillIns: true, wantsJoinBand: true,
  }});
  const lena = await make({ email: "lena@demo.com", type: "MUSICIAN", name: "Lena Vasquez", data: {
    city: "Bridgeport", tagline: "Bassist looking for a band", bio: "Groove-first bassist into post-punk and dream pop.",
    instruments: "Bass, Vocals", genres: "Indie, Post-Punk, Shoegaze", availableForGigs: true, wantsJoinBand: true,
  }});

  // --- Fans ---
  const fan = await make({ email: "fan@demo.com", type: "FAN", name: "Alex Rivera", data: {
    city: "New Haven", tagline: "Lives for local shows", bio: "Out at a CT show most weekends. Say hi!",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
  }});
  const fan2 = await make({ email: "jordan@demo.com", type: "FAN", name: "Jordan Lee", data: {
    city: "Hartford", tagline: "Will travel for good music",
  }});

  // --- Media (for a couple of profiles) ---
  await prisma.mediaItem.createMany({ data: [
    { profileId: owls.id, kind: "VIDEO", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", caption: "Live at The Space" },
    { profileId: owls.id, kind: "IMAGE", url: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=800", caption: "On stage" },
    { profileId: mara.id, kind: "VIDEO", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", caption: "Acoustic session" },
    { profileId: space.id, kind: "IMAGE", url: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800", caption: "The room" },
  ]});

  // --- Events across CT ---
  type EvSeed = { host: { id: string }; venue?: { id: string }; title: string; day: number; hour?: number; city: string; loc: string; genres: string; family?: boolean; cover?: boolean; video?: boolean; desc?: string };
  const evs: EvSeed[] = [
    { host: space, venue: space, title: "The Night Owls + Harbor Lights", day: 4, city: "Hamden", loc: "The Space Ballroom", genres: "Indie, Folk", cover: true, video: true, desc: "Doors 7pm · $15 · All ages" },
    { host: space, venue: space, title: "All-Ages Punk Matinee", day: 9, hour: 14, city: "Hamden", loc: "The Space Ballroom", genres: "Punk, Hardcore", family: true, cover: true, desc: "Early all-ages show, doors at 1." },
    { host: cafenine, venue: cafenine, title: "Tuesday Jazz Jam", day: 2, city: "New Haven", loc: "Cafe Nine", genres: "Jazz", cover: false, desc: "Free weekly jam — bring your axe." },
    { host: cafenine, venue: cafenine, title: "Mara Quinn (solo)", day: 6, city: "New Haven", loc: "Cafe Nine", genres: "Folk, Singer-Songwriter", cover: true },
    { host: stillriver, venue: stillriver, title: "Saturday Night: Brassworks Collective", day: 8, city: "Bristol", loc: "Still River Tavern", genres: "Funk, Soul", cover: true },
    { host: stillriver, venue: stillriver, title: "Family BBQ + Bluegrass", day: 12, hour: 13, city: "Bristol", loc: "Still River Tavern", genres: "Bluegrass, Americana", family: true, cover: false, desc: "Free outdoor show, food trucks, kids welcome." },
    { host: sidecar, venue: sidecar, title: "Shoreline Songwriters Round", day: 5, city: "Mystic", loc: "Sidecar Stage", genres: "Singer-Songwriter, Folk", cover: true },
    { host: owls, title: "The Night Owls at Cafe Nine", day: 15, city: "New Haven", loc: "Cafe Nine", genres: "Indie, Post-Punk", cover: true },
    { host: harbor, title: "Harbor Lights — Waterfront Set", day: 11, hour: 18, city: "Mystic", loc: "Mystic Green", genres: "Folk, Americana", family: true, cover: false },
    { host: brassworks, title: "Brassworks @ Hartford Funk Night", day: 18, city: "Hartford", loc: "The Hall", genres: "Funk, Soul, R&B", cover: true },
    { host: mara, title: "Mara Quinn — House Show", day: 20, city: "New Haven", loc: "Westville House", genres: "Folk, Indie", cover: false, family: true },
    { host: space, venue: space, title: "Emo Nite CT", day: 25, city: "Hamden", loc: "The Space Ballroom", genres: "Emo, Indie", cover: true, video: true },
  ];

  const created: { id: string; hostId: string }[] = [];
  for (const e of evs) {
    const c = coords(e.city);
    const ev = await prisma.event.create({ data: {
      hostProfileId: e.host.id, venueProfileId: e.venue?.id ?? null,
      title: e.title, description: e.desc ?? null, startAt: daysFromNow(e.day, e.hour ?? 20),
      familyFriendly: e.family ?? false, hasCoverCharge: e.cover ?? false, genres: e.genres,
      locationName: e.loc, city: e.city, state: "CT", lat: c?.lat ?? null, lng: c?.lng ?? null,
      coverType: e.video ? "VIDEO" : "IMAGE",
      coverUrl: e.video ? "https://www.youtube.com/watch?v=dQw4w9WgXcQ" : "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1000",
      coverThumbUrl: e.video ? "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800" : null,
    }});
    created.push({ id: ev.id, hostId: e.host.id });
  }

  // --- Follows ---
  const follow = (a: { id: string }, b: { id: string }) => prisma.follow.create({ data: { followerId: a.id, followingId: b.id } }).catch(() => {});
  await Promise.all([
    follow(fan, owls), follow(fan, space), follow(fan, mara), follow(fan, cafenine),
    follow(fan2, brassworks), follow(fan2, stillriver), follow(fan2, owls),
    follow(owls, space), follow(mara, cafenine), follow(harbor, sidecar), follow(space, owls),
    follow(dev, brassworks), follow(lena, owls),
  ]);

  // --- Friendship (fan ↔ fan) ---
  await prisma.friendship.create({ data: { requesterId: fan.id, addresseeId: fan2.id, status: "ACCEPTED" } });

  // --- RSVPs ---
  await prisma.rsvp.createMany({ data: [
    { profileId: fan.id, eventId: created[0].id, status: "GOING" },
    { profileId: fan.id, eventId: created[3].id, status: "GOING" },
    { profileId: fan.id, eventId: created[7].id, status: "MAYBE" },
    { profileId: fan2.id, eventId: created[0].id, status: "GOING" },
    { profileId: fan2.id, eventId: created[4].id, status: "GOING" },
  ]});

  // --- Availability (musicians/bands) ---
  await prisma.availabilityDate.createMany({ data: [
    { profileId: mara.id, date: daysFromNow(7, 0), note: "Evenings only" },
    { profileId: mara.id, date: daysFromNow(14, 0) },
    { profileId: mara.id, date: daysFromNow(21, 0) },
    { profileId: dev.id, date: daysFromNow(10, 0), note: "Will travel" },
    { profileId: dev.id, date: daysFromNow(17, 0) },
    { profileId: harbor.id, date: daysFromNow(28, 0) },
  ]});

  // --- Messages + notifications ---
  const convo = [
    { from: space, to: owls, body: "Loved your last set — want the Friday headline slot on the 4th?" },
    { from: owls, to: space, body: "Yes! We're in. What time's load-in?" },
    { from: space, to: owls, body: "Load-in 5, soundcheck 6:30, doors 7. Putting you on the poster today." },
  ];
  let i = 0;
  for (const m of convo) {
    await prisma.message.create({ data: { senderId: (await uid(m.from.id)), recipientId: (await uid(m.to.id)), body: m.body, createdAt: new Date(Date.now() - (convo.length - i) * 3600_000), readAt: i < 2 ? new Date() : null } });
    i++;
  }
  await prisma.notification.createMany({ data: [
    { userId: await uid(owls.id), type: "MESSAGE", title: "New message from The Space Ballroom", body: "Load-in 5, soundcheck 6:30…", linkUrl: "/dashboard/messages" },
    { userId: await uid(owls.id), type: "FOLLOW", title: "Alex Rivera followed you", linkUrl: `/p/${fan.slug}` },
    { userId: await uid(space.id), type: "RSVP", title: "Alex Rivera is going to The Night Owls + Harbor Lights", linkUrl: `/event/${created[0].id}` },
  ]});

  console.log("✅ Seeded venues, bands, musicians, fans, events, follows, RSVPs, availability & messages.");
  console.log("   Demo logins (password: password123):");
  console.log("   • fan@demo.com · venue@demo.com · musician@demo.com · band@demo.com");
}

// helper: profileId -> userId
async function uid(profileId: string): Promise<string> {
  const p = await prisma.profile.findUnique({ where: { id: profileId }, select: { userId: true } });
  return p!.userId;
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
