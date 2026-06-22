import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { isPro } from "@/lib/plans";
import { isArtist } from "@/lib/constants";
import { ProfileEditor, type ProfileValues } from "@/components/dashboard/ProfileEditor";
import { MediaManager } from "@/components/dashboard/MediaManager";

export const metadata = { title: "Edit profile" };

export default async function EditProfilePage() {
  const user = await requireUser();
  const p = user.profile!;

  const media = await prisma.mediaItem.findMany({
    where: { profileId: p.id },
    orderBy: { sortOrder: "asc" },
  });

  const initial: ProfileValues = {
    type: p.type,
    displayName: p.displayName,
    tagline: p.tagline,
    bio: p.bio,
    city: p.city,
    zip: p.zip,
    address: p.address,
    genres: p.genres,
    instruments: p.instruments,
    avatarUrl: p.avatarUrl,
    bannerUrl: p.bannerUrl,
    websiteUrl: p.websiteUrl,
    instagram: p.instagram,
    spotify: p.spotify,
    youtube: p.youtube,
    bandcamp: p.bandcamp,
    availableForGigs: p.availableForGigs,
    rateMin: p.rateMin,
    rateMax: p.rateMax,
    rateHidden: p.rateHidden,
    isSolo: p.isSolo,
    wantsStartBand: p.wantsStartBand,
    wantsJoinBand: p.wantsJoinBand,
    openForFillIns: p.openForFillIns,
    needsMusicians: p.needsMusicians,
    themeColor: p.themeColor,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Edit your profile</h1>
        <p className="text-sm text-zinc-400">This is your public page at /p/{p.slug}.</p>
      </div>
      <ProfileEditor isPro={isPro(user.plan)} initial={initial} />
      {(p.type === "VENUE" || isArtist(p.type)) && <MediaManager initial={media} />}
    </div>
  );
}
