"use client";

import { Fragment } from "react";
import { useTranslations } from "next-intl";

import { FullscreenToggle } from "@/components/shared/fullscreen-toggle";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Link, usePathname } from "@/i18n/navigation";

const CRUMB_SEGMENTS: Record<string, string> = {
  settings: "settings",
  "page-builder": "pageBuilder",
  media: "media",
  upload: "mediaUpload",
  edit: "mediaEdit",
};

function useDashboardCrumbs() {
  const t = useTranslations("dashboard.breadcrumbs");
  const pathname = usePathname();

  if (pathname === "/dashboard") {
    return [];
  }

  const crumbs: { label: string; href: string }[] = [
    { label: t("dashboard"), href: "/dashboard" },
  ];
  const segments = pathname.split("/").filter(Boolean);
  let href = "/dashboard";

  for (const segment of segments.slice(1)) {
    href = `${href}/${segment}`;
    const key = CRUMB_SEGMENTS[segment];
    if (key) {
      crumbs.push({
        label: t(key as Parameters<typeof t>[0]),
        href,
      });
    }
  }

  return crumbs;
}

export function DashboardHeader() {
  const crumbs = useDashboardCrumbs();

  return (
    <header className="border-sidebar-border bg-background/95 sticky top-0 z-10 w-full border-b backdrop-blur">
      <div className="flex h-14 w-full items-center gap-3 ps-4 pe-4 sm:ps-6 sm:pe-6 md:ps-0">
        <div className="flex h-14 shrink-0 items-center justify-center md:w-(--sidebar-width-icon)">
          <SidebarTrigger />
        </div>
        {crumbs.length > 0 ? (
          <Breadcrumb className="min-w-0">
            <BreadcrumbList className="flex-nowrap">
              {crumbs.map((crumb, index) => {
                const isLast = index === crumbs.length - 1;

                return (
                  <Fragment key={crumb.href}>
                    <BreadcrumbItem className="min-w-0">
                      {isLast ? (
                        <BreadcrumbPage className="truncate text-sm font-semibold">
                          {crumb.label}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink
                          className="truncate"
                          render={<Link href={crumb.href} />}
                        >
                          {crumb.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {isLast ? null : (
                      <BreadcrumbSeparator className="rtl:[&>svg]:rotate-180" />
                    )}
                  </Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        ) : null}
        <div className="ms-auto flex items-center gap-2">
          <div className="hidden sm:block">
            <FullscreenToggle />
          </div>
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
