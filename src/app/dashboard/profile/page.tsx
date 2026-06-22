import { requireUser } from "@/lib/session";
import { isPro } from "@/lib/plans";
import { ProfileForm, type ProfileFormValues } from "@/components/dashboard/ProfileForm";

export const metadata = { title: "Edit profile" };

export default async function ProfilePage() {
  const user = await requireUser();
  const isBand = user.role === "BAND";
  const profile = isBand ? user.bandProfile : user.venueProfile;

  if (!profile) {
    return <p className="text-zinc-400">Profile not found.</p>;
  }

  const initial: ProfileFormValues = {
    name: profile.name,
    tagline: profile.tagline,
    city: profile.city,
    imageUrl: profile.imageUrl,
    bannerUrl: profile.bannerUrl,
    websiteUrl: profile.websiteUrl,
    instagram: profile.instagram,
    themeColor: profile.themeColor,
    ...(isBand && user.bandProfile
      ? {
          bio: user.bandProfile.bio,
          genre: user.bandProfile.genre,
          spotify: user.bandProfile.spotify,
          bandcamp: user.bandProfile.bandcamp,
          youtube: user.bandProfile.youtube,
          lookingForGigs: user.bandProfile.lookingForGigs,
          memberCount: user.bandProfile.memberCount,
        }
      : {}),
    ...(!isBand && user.venueProfile
      ? {
          description: user.venueProfile.description,
          address: user.venueProfile.address,
          genresWanted: user.venueProfile.genresWanted,
          capacity: user.venueProfile.capacity,
          acceptingSubmissions: user.venueProfile.acceptingSubmissions,
        }
      : {}),
  };

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold">Edit your profile</h1>
        <p className="text-sm text-zinc-400">
          This is your public {isBand ? "band" : "venue"} page. Make it shine.
        </p>
      </div>
      <ProfileForm role={user.role as "BAND" | "VENUE"} isPro={isPro(user.plan)} initial={initial} />
    </div>
  );
}
