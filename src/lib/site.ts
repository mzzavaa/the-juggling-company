/**
 * Single source of truth for branding strings, nav, and social links.
 * Keep dynamic content (counts, lists) out of here — derive from collections at build time.
 */

export const site = {
  name: "The Juggling Company",
  tagline: "Brain. Tech. Change.",
  description:
    "Linda Mohamed (@mrs_lee_g) — AWS Hero, juggler, and community builder. Where cognitive science, cloud, and human change converge.",
  url: "https://thejugglingcompany.com",
  author: {
    name: "Linda Mohamed",
    handle: "mrs_lee_g",
    role: "AWS Hero · Juggler · Founder",
    email: "hello@thejugglingcompany.com",
  },
  defaultOgImage: "/images/IMG_9810.jpg",
} as const;

export type NavItem = { readonly label: string; readonly href: string };

export const primaryNav: readonly NavItem[] = [
  { label: "Ideas", href: "/ideas" },
  { label: "Videos", href: "/videos" },
  { label: "Talks", href: "/talks" },
  { label: "Services", href: "/services" },
  { label: "Locations", href: "/locations" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
] as const;

export const footerNav: readonly NavItem[] = [
  { label: "Press", href: "/press" },
  { label: "Products", href: "/products" },
  { label: "Contact", href: "/contact" },
  { label: "Search", href: "/search" },
  { label: "RSS", href: "/rss.xml" },
] as const;

export type SocialIcon = "youtube" | "instagram" | "tiktok" | "linkedin" | "x" | "github" | "external-link";

export interface SocialLink {
  readonly label: string;
  readonly href: string;
  readonly icon: SocialIcon;
  readonly handle?: string;
}

export const socialLinks: readonly SocialLink[] = [
  {
    label: "YouTube",
    href: "https://www.youtube.com/@mrs_lee_g",
    icon: "youtube",
    handle: "@mrs_lee_g",
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@mrs_lee_g_",
    icon: "tiktok",
    handle: "@mrs_lee_g_",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/mrs_lee_g/",
    icon: "instagram",
    handle: "@mrs_lee_g",
  },
  {
    label: "X / Twitter",
    href: "https://x.com/mrs_lee_g",
    icon: "x",
    handle: "@mrs_lee_g",
  },
  {
    label: "AWS Hero profile",
    href: "https://aws.amazon.com/developer/community/heroes/linda-mohamed/",
    icon: "external-link",
  },
] as const;
