"use client";

import {
  HomeIcon,
  ImageIcon,
  LayoutDashboardIcon,
  LayoutTemplateIcon,
  SettingsIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { UserMenu } from "@/components/dashboard/user/user-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { getDirection, type Locale } from "@/i18n/config";
import { Link, usePathname } from "@/i18n/navigation";
import type { SessionUser } from "@/lib/auth/types";

type Props = React.ComponentProps<typeof Sidebar> & {
  isAdmin: boolean;
  user: SessionUser;
};

export function AppSidebar({ isAdmin, user, ...props }: Props) {
  const t = useTranslations("dashboard.nav");
  const pathname = usePathname();
  const locale = useLocale() as Locale;
  const side = getDirection(locale) === "rtl" ? "right" : "left";
  const { isMobile, setOpenMobile } = useSidebar();

  function isActiveItem(href: string) {
    return href === "/" || href === "/dashboard"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);
  }

  const navigationItems = [
    { title: t("mainPage"), href: "/", icon: HomeIcon },
    { title: t("dashboard"), href: "/dashboard", icon: LayoutDashboardIcon },
    {
      title: t("pageBuilder"),
      href: "/dashboard/page-builder",
      icon: LayoutTemplateIcon,
    },
    {
      title: t("media"),
      href: "/dashboard/media",
      icon: ImageIcon,
    },
    ...(isAdmin
      ? [
          {
            title: t("settings"),
            href: "/dashboard/settings",
            icon: SettingsIcon,
          },
        ]
      : []),
  ];

  const activeTitle =
    navigationItems
      .filter((item) => isActiveItem(item.href))
      .toSorted((a, b) => b.href.length - a.href.length)[0]?.title ??
    t("dashboard");

  return (
    <Sidebar collapsible="icon" side={side} {...props}>
      <SidebarHeader className="group-data-[collapsible=icon]:h-0 group-data-[collapsible=icon]:overflow-hidden group-data-[collapsible=icon]:p-0">
        <div className="flex h-12 items-center px-2">
          <span className="truncate text-sm font-semibold group-data-[collapsible=icon]:hidden">
            {activeTitle}
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        <SidebarGroup className="group-data-[collapsible=icon]:pt-3">
          <SidebarGroupLabel>{t("menu")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    title={item.title}
                    isActive={isActiveItem(item.href)}
                    onClick={() => {
                      if (isMobile) setOpenMobile(false);
                    }}
                    render={(props) => {
                      const linkProps = { ...props } as React.ComponentProps<
                        typeof Link
                      > & { nativeButton?: boolean };
                      delete linkProps.nativeButton;

                      return <Link {...linkProps} href={item.href} />;
                    }}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <UserMenu user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
