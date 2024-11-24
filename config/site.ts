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
  ],
  managerNavItems: [
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
      label: "管理",
      href: "/manager",
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
