import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { Navbar as NextUINavbar, NavbarContent, NavbarMenuItem, NavbarMenuToggle, NavbarMenu, NavbarBrand, NavbarItem } from "@nextui-org/navbar";
import NextLink from "next/link";
import clsx from "clsx";
import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { DiscordIcon, Logo } from "@/components/icons";
import { useState } from "react";
import { Link } from "@nextui-org/react";
import { signIn } from "next-auth/react";

export const Navbar = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [userimage, setUserImage] = useState();
  const handleSignIn = () => {
    signIn("discord", { callbackUrl: "/" }); // Discordでのサインイン
  };

  return (
    <NextUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="hidden basis-1/5 sm:flex" justify="start">

        <NavbarBrand className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo />
            <p className="font-bold text-inherit">aBC DAO</p>
          </NextLink>
        </NavbarBrand>
        <div className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className="text-foreground hover:text-primary transition-colors duration-200 data-[active=true]:text-primary data-[active=true]:font-medium"
                href={item.href}

              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </div>
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                color={
                  index === 2
                    ? "primary"
                    : index === siteConfig.navMenuItems.length - 1
                      ? "danger"
                      : "foreground"
                }
                href={item.href}
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="start">
        <NavbarMenuToggle />
        <NavbarBrand className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo />
            <p className="font-bold text-inherit">aBC DAO</p>
          </NextLink>
        </NavbarBrand>
      </NavbarContent>





      <NavbarContent className="sm:flex basis-1/5" justify="end">
        <NavbarItem className="sm:flex gap-2">
          <Link isExternal href={"https://discord.gg/6wpa6ZQVzg"} title="Discord">
            <DiscordIcon className="text-default-500" />
          </Link>
          <ThemeSwitch />
        </NavbarItem>
        {session ? (
          <NavbarItem className="md:flex">
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  isBordered
                  as="button"
                  className="transition-transform"
                  name={session.user?.name || "User"}
                  size="sm"
                  src={session.user?.image || ""}
                />
              </DropdownTrigger>
              {/* アイコン内のメニューはここで設定 */}
              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="profile" className="h-14 gap-2">
                  <p className="font-semibold">Signed in as</p>
                  <p className="font-semibold">{session.user?.name}</p>
                </DropdownItem>
                <DropdownItem key="logout" className="h-14 gap-2" onClick={() => signOut()}>
                  Sign Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
        ) : (
          null
        )}
      </NavbarContent>
    </NextUINavbar>
  );
};