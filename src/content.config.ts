import { defineCollection, reference, z } from "astro:content";
import { glob } from "astro/loaders";

const slug = z
  .string()
  .min(1)
  .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, "slug must be kebab-case");

const isoDate = z.coerce.date();

const pillar = z.enum(["brain", "tech", "change"]);

const idea = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/idea" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      slug,
      summary: z.string(),
      hero: image().optional(),
      heroAlt: z.string().optional(),
      order: z.number().int().nonnegative().default(0),
      tags: z.array(z.string()).default([]),
      pillars: z.array(pillar).min(1),
      updatedAt: isoDate,
      draft: z.boolean().default(false),
      related: z.array(reference("idea")).default([]),
    }),
});

const video = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx,yaml,yml}", base: "./src/content/video" }),
  schema: z.object({
    title: z.string(),
    slug,
    source: z.enum(["youtube", "tiktok", "instagram"]),
    externalId: z.string(),
    externalUrl: z.string().url(),
    localVideo: z.string().optional(),
    publishedAt: isoDate,
    durationSec: z.number().int().positive(),
    tags: z.array(z.string()).default([]),
    pillars: z.array(pillar).default([]),
    description: z.string().default(""),
    locationSlug: reference("location").optional(),
    ideaSlugs: z.array(reference("idea")).default([]),
    featured: z.boolean().default(false),
  }),
});

const talk = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx,yaml,yml}", base: "./src/content/talk" }),
  schema: z.object({
    title: z.string(),
    slug,
    date: isoDate,
    venue: z.string(),
    city: z.string(),
    country: z.string(),
    abstract: z.string(),
    jugglingConnection: z.string().optional(),
    slidesUrl: z.string().url().optional(),
    recordingUrl: z.string().url().optional(),
    locationSlug: reference("location").optional(),
    pillars: z.array(pillar).default([]),
    upcoming: z.boolean().default(false),
  }),
});

const priceModel = z.enum(["inquire", "fixed", "tiered"]);

const service = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/service" }),
  schema: z.object({
    title: z.string(),
    slug,
    summary: z.string(),
    audience: z.string(),
    whatsIncluded: z.array(z.string()).min(1),
    formats: z.array(z.string()).min(1),
    priceModel,
    ctaUrl: z.string(),
    order: z.number().int().nonnegative().default(0),
  }),
});

const product = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx,yaml,yml}", base: "./src/content/product" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      slug,
      summary: z.string(),
      image: image().optional(),
      imageAlt: z.string().optional(),
      priceCents: z.number().int().nonnegative().optional(),
      externalUrl: z.string().url(),
      category: z.string(),
      inStock: z.boolean().default(true),
    }),
});

const locationType = z.enum(["past-performance", "home-base", "available", "workshop", "juggling-shop"]);

const shopCategory = z.enum([
  "balls",
  "clubs",
  "rings",
  "diabolos",
  "poi",
  "staff",
  "cigar-boxes",
  "contact",
  "fire",
  "led",
  "unicycles",
  "aerial",
  "flowersticks",
  "hats",
  "general",
  "magic",
]);

const region = z.enum(["europe", "north-america", "south-america", "asia", "oceania", "africa"]);

// Photo with attribution for proper licensing
const shopPhoto = z.object({
  url: z.string(),
  alt: z.string().optional(),
  attribution: z.string().optional(), // e.g., "Google Maps", "Shop website", "User submission"
  source: z.string().url().optional(), // Link to original source
});

// Community review
const shopReview = z.object({
  author: z.string(),
  avatar: z.string().optional(),
  rating: z.number().min(1).max(5),
  date: z.coerce.date(),
  text: z.string(),
  source: z.enum(["google", "community", "verified"]).default("community"),
});

// Opening hours for a day
const dayHours = z.object({
  open: z.string().optional(), // "09:00"
  close: z.string().optional(), // "18:30"
  closed: z.boolean().default(false),
});

const location = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx,yaml,yml}", base: "./src/content/location" }),
  schema: z.object({
    name: z.string(),
    slug,
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    country: z.string(),
    city: z.string(),
    type: locationType,
    notes: z.string().default(""),
    photos: z.array(z.union([z.string(), shopPhoto])).default([]),
    website: z.string().url().optional(),
    
    // Shop-specific fields (optional, only for juggling-shop type)
    address: z.string().optional(),
    brands: z.array(z.string()).default([]),
    categories: z.array(shopCategory).default([]),
    physicalStore: z.boolean().default(false),
    onlineStore: z.boolean().default(false),
    shipsWorldwide: z.boolean().optional(),
    foundedYear: z.number().int().min(1900).max(2030).optional(),
    isManufacturer: z.boolean().default(false),
    
    // New fields for enhanced shop directory
    region: region.optional(),
    verified: z.boolean().default(false),
    lastVerified: z.coerce.date().optional(),
    
    // Google/external ratings
    rating: z.number().min(0).max(5).optional(),
    reviewCount: z.number().int().nonnegative().optional(),
    googlePlaceId: z.string().optional(),
    
    // Opening hours
    hours: z.object({
      monday: dayHours.optional(),
      tuesday: dayHours.optional(),
      wednesday: dayHours.optional(),
      thursday: dayHours.optional(),
      friday: dayHours.optional(),
      saturday: dayHours.optional(),
      sunday: dayHours.optional(),
      notes: z.string().optional(), // e.g., "Closed on public holidays"
    }).optional(),
    
    // Quick info
    languages: z.array(z.string()).default([]),
    paymentMethods: z.array(z.string()).default([]), // "Cash", "Card", "PayPal"
    taxFree: z.boolean().optional(),
    returnPolicy: z.string().optional(), // e.g., "14 days"
    
    // What they sell (more descriptive categories)
    sellsCategories: z.array(z.string()).default([]), // "Juggling equipment", "Beginners to pro gear", etc.
    
    // Community reviews
    reviews: z.array(shopReview).default([]),
  }),
});

const press = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx,yaml,yml}", base: "./src/content/press" }),
  schema: z.object({
    outlet: z.string(),
    title: z.string(),
    url: z.string().url(),
    date: isoDate,
    excerpt: z.string(),
    logo: z.string().optional(),
  }),
});

const post = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/post" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      slug,
      summary: z.string(),
      date: isoDate,
      tags: z.array(z.string()).default([]),
      pillars: z.array(pillar).default([]),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      coverVideo: z.string().optional(),
      draft: z.boolean().default(false),
      personal: z.boolean().default(false),
    }),
});

export const collections = { idea, video, talk, service, product, location, press, post };
