export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "aBC DAO",
  description: "Make beautiful websites regardless of your design unexperience.",
  navItems: [
    {
      label: "ホーム",
      href: "/",
    },
    {
      label: "投票",
      href: "/vote",
    },
    {
      label: "メンバー",
      href: "/member",
    },
    {
      label: "Blog",
      href: "/blog",
    },
    {
      label: "About",
      href: "/about",
    },
  ],
  navMenuItems: [
    {
      label: "ホーム",
      href: "/",
    },
    {
      label: "投票",
      href: "/vote",
    },
    {
      label: "メンバー",
      href: "/member",
    },
    {
      label: "Team",
      href: "/team",
    },
    {
      label: "Calendar",
      href: "/calendar",
    },
    {
      label: "Settings",
      href: "/settings",
    },
    {
      label: "Help & Feedback",
      href: "/help-feedback",
    },

  ],
  links: {
    github: "https://github.com/nextui-org/nextui",
    twitter: "https://twitter.com/getnextui",
    docs: "https://nextui.org",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
  },
};
