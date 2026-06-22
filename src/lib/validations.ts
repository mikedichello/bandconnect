import { z } from "zod";

const urlOptional = z
  .string()
  .trim()
  .url("Enter a valid URL (including https://)")
  .optional()
  .or(z.literal(""));

const hexOptional = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Use a hex color like #7c4dff")
  .optional()
  .or(z.literal(""));

// --- Auth -------------------------------------------------------------------

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10, "Invalid reset token"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

export const signupSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  role: z.enum(["FAN", "VENUE", "MUSICIAN", "BAND"], {
    errorMap: () => ({ message: "Choose a profile type" }),
  }),
  displayName: z.string().min(2, "Name must be at least 2 characters").max(80),
  city: z.string().max(80).optional().or(z.literal("")),
  zip: z.string().max(10).optional().or(z.literal("")),
});

export type SignupInput = z.infer<typeof signupSchema>;

// --- Profile (superset; fields are gated by type server-side) ---------------

export const profileSchema = z.object({
  displayName: z.string().min(2, "Name is required").max(80),
  tagline: z.string().max(140).optional().or(z.literal("")),
  bio: z.string().max(3000).optional().or(z.literal("")),
  city: z.string().max(80).optional().or(z.literal("")),
  zip: z.string().max(10).optional().or(z.literal("")),
  address: z.string().max(160).optional().or(z.literal("")),
  genres: z.string().max(300).optional().or(z.literal("")),
  instruments: z.string().max(300).optional().or(z.literal("")),
  avatarUrl: urlOptional,
  bannerUrl: urlOptional,
  websiteUrl: urlOptional,
  instagram: z.string().max(120).optional().or(z.literal("")),
  spotify: urlOptional,
  youtube: urlOptional,
  bandcamp: urlOptional,
  availableForGigs: z.boolean().optional(),
  rateMin: z.coerce.number().int().min(0).max(1000000).optional().nullable(),
  rateMax: z.coerce.number().int().min(0).max(1000000).optional().nullable(),
  rateHidden: z.boolean().optional(),
  isSolo: z.boolean().optional(),
  wantsStartBand: z.boolean().optional(),
  wantsJoinBand: z.boolean().optional(),
  openForFillIns: z.boolean().optional(),
  needsMusicians: z.boolean().optional(),
  themeColor: hexOptional,
});

export type ProfileInput = z.infer<typeof profileSchema>;

// --- Events -----------------------------------------------------------------

export const eventSchema = z.object({
  title: z.string().min(2, "Title is required").max(140),
  description: z.string().max(3000).optional().or(z.literal("")),
  coverUrl: urlOptional,
  coverType: z.enum(["IMAGE", "VIDEO"]).optional(),
  coverThumbUrl: urlOptional,
  startAt: z.string().min(1, "Pick a start date & time"),
  endAt: z.string().optional().or(z.literal("")),
  familyFriendly: z.boolean().optional(),
  hasCoverCharge: z.boolean().optional(),
  genres: z.string().max(300).optional().or(z.literal("")),
  locationName: z.string().max(140).optional().or(z.literal("")),
  address: z.string().max(200).optional().or(z.literal("")),
  city: z.string().max(80).optional().or(z.literal("")),
  zip: z.string().max(10).optional().or(z.literal("")),
});

export type EventInput = z.infer<typeof eventSchema>;

// --- Media ------------------------------------------------------------------

export const mediaSchema = z.object({
  kind: z.enum(["IMAGE", "VIDEO"]),
  url: z.string().trim().url("Enter a valid URL"),
  caption: z.string().max(160).optional().or(z.literal("")),
});

export type MediaInput = z.infer<typeof mediaSchema>;

// --- Availability -----------------------------------------------------------

export const availabilitySchema = z.object({
  date: z.string().min(1, "Pick a date"),
  note: z.string().max(160).optional().or(z.literal("")),
});

// --- Messages ---------------------------------------------------------------

export const messageSchema = z.object({
  recipientId: z.string().min(1, "Recipient is required"),
  body: z.string().min(1, "Message can't be empty").max(2000),
});

export type MessageInput = z.infer<typeof messageSchema>;
