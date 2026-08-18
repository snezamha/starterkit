"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type NavSubLink = { label: string; href: string };
type NavLink = { label: string; href: string; children?: NavSubLink[] };

function DesktopNavItem({ link }: { link: NavLink }) {
  const hasChildren = (link.children?.length ?? 0) > 0;

  if (!hasChildren) {
    return (
      <a
        href={link.href}
        className="text-foreground/80 hover:text-foreground text-sm font-medium"
      >
        {link.label}
      </a>
    );
  }

  return (
    <div className="group relative">
      <button
        type="button"
        className="text-foreground/80 hover:text-foreground flex items-center gap-1 text-sm font-medium"
      >
        {link.label}
        <ChevronDown className="size-3.5" />
      </button>
      <div className="invisible absolute start-0 top-full min-w-40 translate-y-1 rounded-[var(--radius-md)] border border-border bg-background py-1.5 opacity-0 shadow-[var(--shadow-md)] transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        {link.children?.map((child, i) => (
          <a
            key={i}
            href={child.href}
            className="text-foreground/80 hover:bg-muted hover:text-foreground block px-4 py-2 text-sm"
          >
            {child.label}
          </a>
        ))}
      </div>
    </div>
  );
}

function MobileNavItem({ link }: { link: NavLink }) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = (link.children?.length ?? 0) > 0;

  if (!hasChildren) {
    return (
      <a
        href={link.href}
        className="text-foreground/80 hover:text-foreground rounded-md px-2 py-2 text-sm font-medium"
      >
        {link.label}
      </a>
    );
  }

  return (
    <div>
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
        className="text-foreground/80 hover:text-foreground flex w-full items-center justify-between rounded-md px-2 py-2 text-sm font-medium"
      >
        {link.label}
        <ChevronDown
          className={`size-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      {expanded ? (
        <div className="ms-3 flex flex-col gap-1 border-s border-border ps-3">
          {link.children?.map((child, i) => (
            <a
              key={i}
              href={child.href}
              className="text-foreground/80 hover:text-foreground rounded-md px-2 py-2 text-sm"
            >
              {child.label}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function NavbarClient({
  logoText,
  logoImageSrc,
  links,
  ctaLabel,
  ctaHref,
  sticky,
}: {
  logoText: string;
  logoImageSrc: string;
  links: NavLink[];
  ctaLabel: string;
  ctaHref: string;
  sticky: boolean;
}) {
  const [open, setOpen] = useState(false);
  const homeHref = "/";

  return (
    <header
      className={`bg-background border-border border-b ${sticky ? "sticky top-0 z-40" : ""}`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-[var(--spacing-md)] py-4">
        <a href={homeHref} className="flex items-center gap-2 font-semibold">
          {logoImageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoImageSrc} alt={logoText} className="h-8 w-auto" />
          ) : (
            <span className="text-foreground text-lg">{logoText}</span>
          )}
        </a>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link, i) => (
            <DesktopNavItem key={i} link={link} />
          ))}
        </nav>

        <div className="hidden items-center md:flex">
          {ctaLabel && ctaHref ? (
            <a
              href={ctaHref}
              className="bg-primary text-primary-foreground rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium"
            >
              {ctaLabel}
            </a>
          ) : null}
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="border-border text-foreground grid size-9 place-items-center rounded-md border md:hidden"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open ? (
        <nav className="border-border flex flex-col gap-1 border-t px-[var(--spacing-md)] py-3 md:hidden">
          {links.map((link, i) => (
            <MobileNavItem key={i} link={link} />
          ))}
          {ctaLabel && ctaHref ? (
            <a
              href={ctaHref}
              className="bg-primary text-primary-foreground mt-2 rounded-[var(--radius-md)] px-4 py-2 text-center text-sm font-medium"
            >
              {ctaLabel}
            </a>
          ) : null}
        </nav>
      ) : null}
    </header>
  );
}
