export const site = {
  name: "theJugglingCompany.com",
  nameShort: "theJugglingCompany",
  tagline: "Everyone juggles. Everyone belongs.",
  description:
    "Linda Mohamed - AWS Hero, keynote speaker, and juggler based in Vienna. Juggling has no prerequisites - it grows grey matter, reduces anxiety, and belongs to everyone. Brain. Tech. Change.",
  url: "https://thejugglingcompany.com",
  author: {
    name: "Linda Mohamed",
    handle: "linda_mhmd",
    role: "AWS Hero · Juggler · Founder",
    email: "hello@thejugglingcompany.com",
  },
  defaultOgImage: "/images/og-juggling-hands-rgb-light.png",
} as const;

export type NavChild = {
  readonly label: string;
  readonly href: string;
  readonly description: string;
  readonly accent: string;
  readonly icon: string;
  readonly external?: boolean;
};

export type NavItem = {
  readonly label: string;
  readonly href: string;
  readonly children?: readonly NavChild[];
  readonly megaColumns?: number;
  readonly megaWidth?: string;
};

export const primaryNav: readonly NavItem[] = [
  {
    label: "Learn",
    href: "/learn",
    megaColumns: 3,
    megaWidth: "700px",
    children: [
      {
        label: "The Three Props",
        href: "/learn/the-three-props",
        description: "Ball, club, and ring - three positions every person holds in a change.",
        accent: "var(--color-brain-change)",
        icon: "layers",
      },
      {
        label: "Brain Science",
        href: "/learn/brain",
        description: "What juggling does to grey matter, focus, and the way humans learn.",
        accent: "var(--color-brain)",
        icon: "brain",
      },
      {
        label: "Tech & Systems",
        href: "/learn/tech",
        description: "Cloud architecture and distributed systems through a juggler's lens.",
        accent: "var(--color-tech)",
        icon: "cpu",
      },
      {
        label: "The Cascade",
        href: "/learn/the-cascade",
        description: "The foundation pattern. Three balls, two hands, one repeating arc.",
        accent: "var(--color-tech-change)",
        icon: "cascade",
      },
      {
        label: "Change Management",
        href: "/learn/change",
        description: "How teams absorb new work, recover from drops, and stay stable.",
        accent: "var(--color-change)",
        icon: "shuffle",
      },
      {
        label: "The Infinite Game",
        href: "/learn/the-infinite-game",
        description: "Juggling as Simon Sinek's infinite game - no winner, no end, just continuation.",
        accent: "var(--color-brain-tech)",
        icon: "infinite-game",
      },
    ],
  },
  {
    label: "Watch",
    href: "/videos",
    children: [
      {
        label: "Juggling",
        href: "/videos",
        description: "Balls, clubs, and rings in motion. Live performances and practice clips.",
        accent: "var(--color-brain)",
        icon: "ball",
      },
      {
        label: "Talks & Podcasts",
        href: "/talks",
        description: "AWS re:Invent, community events, and podcast conversations.",
        accent: "var(--color-tech)",
        icon: "calendar",
      },
      {
        label: "Short Clips",
        href: "/videos#tiktok",
        description: "Quick juggling moments from everyday life.",
        accent: "var(--color-change)",
        icon: "tiktok",
      },
    ],
  },
  {
    label: "Blog",
    href: "/blog",
  },
  {
    label: "Services",
    href: "/services",
  },
  {
    label: "Ecosystem",
    href: "#",
    megaColumns: 2,
    megaWidth: "580px",
    children: [
      {
        label: "Freelancer Templates",
        href: "https://freelancer-templates.org",
        description: "200+ free contracts, proposals, invoices, and email scripts for freelancers.",
        accent: "#4f9ef8",
        icon: "templates",
        external: true,
      },
      {
        label: "AI Workshops",
        href: "https://ai-workshops.online",
        description: "Enterprise AI workshops with Linda - from PoC to full implementation.",
        accent: "#a855f7",
        icon: "workshop",
        external: true,
      },
      {
        label: "Freelancer Automation",
        href: "https://freelancer-automation.com",
        description: "AgentCore framework - AI automation tools built for freelancers.",
        accent: "#f59e0b",
        icon: "automation",
        external: true,
      },
      {
        label: "AI Solutions Wiki",
        href: "https://ai-solutions.wiki",
        description: "A searchable knowledge base of AI tools, solutions, and use cases.",
        accent: "#10b981",
        icon: "wiki",
        external: true,
      },
    ],
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
  { label: "Imprint", href: "/imprint" },
  { label: "Datenschutz", href: "/datenschutz" },
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
    href: "https://x.com/linda_mhmd",
    icon: "x",
    handle: "@linda_mhmd",
  },
  {
    label: "GitHub",
    href: "https://github.com/linda-mhmd",
    icon: "github",
    handle: "@linda-mhmd",
  },
  {
    label: "AWS Hero profile",
    href: "https://aws.amazon.com/developer/community/heroes/linda-mohamed/",
    icon: "external-link",
  },
] as const;
