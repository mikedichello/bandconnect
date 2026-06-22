import { z } from "zod";

// --- Auth -------------------------------------------------------------------

export const signupSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
  role: z.enum(["BAND", "VENUE"], {
    errorMap: () => ({ message: "Choose whether you're a band or a venue" }),
  }),
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  city: z.string().max(80).optional().or(z.literal("")),
});

export type SignupInput = z.infer<typeof signupSchema>;

// --- Profiles ---------------------------------------------------------------

const urlOptional = z
  .string()
  .trim()
  .url("Enter a valid URL (including https://)")
  .optional()
  .or(z.literal(""));

export const bandProfileSchema = z.object({
  name: z.string().min(2, "Name is required").max(80),
  tagline: z.string().max(120).optional().or(z.literal("")),
  bio: z.string().max(2000).optional().or(z.literal("")),
  genre: z.string().max(200).optional().or(z.literal("")),
  city: z.string().max(80).optional().or(z.literal("")),
  imageUrl: urlOptional,
  bannerUrl: urlOptional,
  websiteUrl: urlOptional,
  instagram: z.string().max(120).optional().or(z.literal("")),
  spotify: urlOptional,
  bandcamp: urlOptional,
  youtube: urlOptional,
  lookingForGigs: z.boolean().optional(),
  memberCount: z.coerce.number().int().min(1).max(50).optional().nullable(),
  themeColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Use a hex color like #7c4dff")
    .optional()
    .or(z.literal("")),
});

export type BandProfileInput = z.infer<typeof bandProfileSchema>;

export const venueProfileSchema = z.object({
  name: z.string().min(2, "Name is required").max(80),
  tagline: z.string().max(120).optional().or(z.literal("")),
  description: z.string().max(2000).optional().or(z.literal("")),
  city: z.string().max(80).optional().or(z.literal("")),
  address: z.string().max(160).optional().or(z.literal("")),
  capacity: z.coerce.number().int().min(0).max(100000).optional().nullable(),
  genresWanted: z.string().max(200).optional().or(z.literal("")),
  imageUrl: urlOptional,
  bannerUrl: urlOptional,
  websiteUrl: urlOptional,
  instagram: z.string().max(120).optional().or(z.literal("")),
  acceptingSubmissions: z.boolean().optional(),
  themeColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Use a hex color like #7c4dff")
    .optional()
    .or(z.literal("")),
});

export type VenueProfileInput = z.infer<typeof venueProfileSchema>;

// --- Events -----------------------------------------------------------------

export const eventSchema = z.object({
  title: z.string().min(2, "Title is required").max(120),
  description: z.string().max(1000).optional().or(z.literal("")),
  date: z.string().min(1, "Pick a date and time"),
  city: z.string().max(80).optional().or(z.literal("")),
  venueName: z.string().max(120).optional().or(z.literal("")),
  bandName: z.string().max(120).optional().or(z.literal("")),
  ticketUrl: urlOptional,
  isPublic: z.boolean().optional(),
});

export type EventInput = z.infer<typeof eventSchema>;

// --- Submissions ------------------------------------------------------------

export const submissionSchema = z.object({
  venueProfileId: z.string().min(1, "Venue is required"),
  subject: z.string().min(2, "Subject is required").max(120),
  message: z.string().min(10, "Tell the venue a bit about your band").max(2000),
  proposedDate: z.string().optional().or(z.literal("")),
});

export type SubmissionInput = z.infer<typeof submissionSchema>;

export const submissionStatusSchema = z.object({
  status: z.enum(["PENDING", "ACCEPTED", "DECLINED"]),
});

// --- Messages ---------------------------------------------------------------

export const messageSchema = z.object({
  recipientId: z.string().min(1, "Recipient is required"),
  body: z.string().min(1, "Message can't be empty").max(2000),
});

export type MessageInput = z.infer<typeof messageSchema>;
