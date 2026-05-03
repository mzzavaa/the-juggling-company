/**
 * Single source of truth for branding strings, nav, and social links.
 * Keep dynamic content (counts, lists) out of here — derive from collections at build time.
 */

export const site = {
  name: "The Juggling Company",
  tagline: "Where juggling meets innovation.",
  description:
    "Inspiring, educating, and empowering individuals through the art of juggling — bridging physical fitness, cognitive development, and creative expression.",
  url: "https://thejugglingcompany.com",
  author: {
    name: "Linda Mohamed",
    role: "Founder",
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
