export const site = {
  name: "theJugglingCompany.com",
  nameShort: "theJugglingCompany",
  tagline: "Everyone juggles. Everyone belongs.",
  description:
    "Linda Mohamed - AWS Hero, juggler, and community builder. Juggling has no prerequisites. No size, age, or background requirement. When you juggle, you are enough.",
  url: "https://thejugglingcompany.com",
  author: {
    name: "Linda Mohamed",
    handle: "mrs_lee_g",
    role: "AWS Hero · Juggler · Founder",
    email: "hello@thejugglingcompany.com",
  },
  defaultOgImage: "/images/IMG_9810.jpg",
} as const;

export type NavChild = {
  readonly label: string;
  readonly href: string;
  readonly description: string;
  readonly accent: string;
};

export type NavItem = {
  readonly label: string;
  readonly href: string;
  readonly children?: readonly NavChild[];
};

export const primaryNav: readonly NavItem[] = [
  {
    label: "Watch",
    href: "/videos",
    children: [
      {
        label: "Juggling",
        href: "/videos",
        description: "Balls, clubs, and rings in motion. Live performances and practice clips.",
        accent: "var(--color-brain)",
      },
      {
        label: "Talks & Podcasts",
        href: "/talks",
        description: "AWS re:Invent sessions, community conversations, and podcast appearances.",
        accent: "var(--color-tech)",
      },
      {
        label: "Short Clips",
        href: "/videos#tiktok",
        description: "Quick juggling moments from everyday life - on TikTok.",
        accent: "var(--color-change)",
      },
    ],
  },
  {
    label: "Why Juggle?",
    href: "/ideas",
  },
  {
    label: "Shops",
    href: "/locations/juggling-shops",
    children: [
      {
        label: "Juggling Shops",
        href: "/locations/juggling-shops",
        description: "Find specialist juggling shops near you - worldwide directory.",
        accent: "var(--color-brain-change)",
      },
      {
        label: "Map",
        href: "/locations",
        description: "Performances, workshops, and juggling spots around the world.",
        accent: "var(--color-tech-change)",
      },
    ],
  },
  {
    label: "Services",
    href: "/services",
  },
  {
    label: "Blog",
    href: "/blog",
  },
  {
    label: "About",
    href: "/about",
  },
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
