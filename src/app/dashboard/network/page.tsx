import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { initials } from "@/lib/utils";
import { FriendButton } from "@/components/FriendButton";
import { profileTypeMeta } from "@/lib/constants";

export const metadata = { title: "Network" };

export default async function NetworkPage() {
  const user = await requireUser();
  const profile = user.profile!;
  const isFan = profile.type === "FAN";

  const [following, followers, pending, friends] = await Promise.all([
    prisma.follow.findMany({ where: { followerId: profile.id }, include: { following: true }, take: 100 }),
    prisma.follow.findMany({ where: { followingId: profile.id }, include: { follower: true }, take: 100 }),
    isFan
      ? prisma.friendship.findMany({ where: { addresseeId: profile.id, status: "PENDING" }, include: { requester: true } })
      : Promise.resolve([]),
    isFan
      ? prisma.friendship.findMany({
          where: { status: "ACCEPTED", OR: [{ requesterId: profile.id }, { addresseeId: profile.id }] },
          include: { requester: true, addressee: true },
        })
      : Promise.resolve([]),
  ]);

  const friendProfiles = friends.map((f) => (f.requesterId === profile.id ? f.addressee : f.requester));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold">Your network</h1>
        <p className="text-sm text-zinc-400">People and places you&apos;re connected to.</p>
      </div>

      {isFan && pending.length > 0 && (
        <Section title={`Friend requests (${pending.length})`}>
          <div className="grid gap-3 sm:grid-cols-2">
            {pending.map((f) => (
              <div key={f.id} className="card flex items-center justify-between gap-3 p-4">
                <PersonLink slug={f.requester.slug} name={f.requester.displayName} sub="wants to be friends" />
                <FriendButton targetProfileId={f.requester.id} initialState="pending_in" loggedIn loginHref="/login" />
              </div>
            ))}
          </div>
        </Section>
      )}

      {isFan && (
        <Section title={`Friends (${friendProfiles.length})`}>
          {friendProfiles.length === 0 ? <Empty text="No friends yet. Add other fans from their profiles." /> : <Grid people={friendProfiles} />}
        </Section>
      )}

      <Section title={`Following (${following.length})`}>
        {following.length === 0 ? <Empty text="You're not following anyone yet." /> : <Grid people={following.map((f) => f.following)} />}
      </Section>

      <Section title={`Followers (${followers.length})`}>
        {followers.length === 0 ? <Empty text="No followers yet." /> : <Grid people={followers.map((f) => f.follower)} />}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">{title}</h2>
      {children}
    </section>
  );
}

function Grid({ people }: { people: { id: string; slug: string; displayName: string; type: string }[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {people.map((p) => (
        <Link key={p.id} href={`/p/${p.slug}`} className="card flex items-center gap-3 p-4 transition hover:border-white/20">
          <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-brand-500/20 text-sm font-bold text-brand-200">{initials(p.displayName)}</span>
          <div className="min-w-0">
            <p className="truncate font-medium text-white">{p.displayName}</p>
            <p className="text-xs text-zinc-500">{profileTypeMeta(p.type).label}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function PersonLink({ slug, name, sub }: { slug: string; name: string; sub: string }) {
  return (
    <Link href={`/p/${slug}`} className="flex items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-500/20 text-sm font-bold text-brand-200">{initials(name)}</span>
      <div>
        <p className="font-medium text-white">{name}</p>
        <p className="text-xs text-zinc-500">{sub}</p>
      </div>
    </Link>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="card p-6 text-sm text-zinc-400">{text}</p>;
}
