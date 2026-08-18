import { linkPickerField } from "@/features/page-builder/puck/fields/link-picker";
import { mediaPickerField } from "@/features/page-builder/puck/fields/media-picker";
import {
  sanitizeLinkUrl,
  sanitizeMediaUrl,
} from "@/features/page-builder/puck/safety";
import type { PuckRenderProps } from "@/features/page-builder/puck/render-types";

import { NavbarClient } from "@/features/page-builder/puck/components/site-client";
import {
  getSocialIcon,
  socialPlatforms,
} from "@/features/page-builder/puck/social-icons";

type NavSubLink = { label: string; href: string };
type NavLink = { label: string; href: string; children?: NavSubLink[] };
type NavbarProps = PuckRenderProps & {
  logoText?: string;
  logoImageSrc?: string;
  links?: NavLink[];
  ctaLabel?: string;
  ctaHref?: string;
  sticky?: boolean;
};
type FooterColumn = { title: string; links: NavLink[] };
type FooterProps = PuckRenderProps & {
  columns?: FooterColumn[];
  copyrightText?: string;
};
type SocialLink = { platform: string; href: string };
type SocialBarProps = PuckRenderProps & {
  links?: SocialLink[];
  size?: string;
  align?: string;
  variant?: string;
};

const socialIconSizeMap: Record<string, string> = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
};

const socialAlignMap: Record<string, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
};

export const siteComponents = {
  Navbar: {
    label: "Navbar",
    fields: {
      logoText: { type: "text" as const, contentEditable: true },
      logoImageSrc: mediaPickerField,
      links: {
        type: "array" as const,
        arrayFields: {
          label: { type: "text" as const, contentEditable: true },
          href: linkPickerField,
          children: {
            type: "array" as const,
            arrayFields: {
              label: { type: "text" as const, contentEditable: true },
              href: linkPickerField,
            },
            getItemSummary: (item: NavSubLink) => item.label || "Link",
            defaultItemProps: { label: "Link", href: "/" },
          },
        },
        getItemSummary: (item: NavLink) => item.label || "Link",
        defaultItemProps: { label: "Link", href: "/", children: [] },
      },
      ctaLabel: { type: "text" as const, contentEditable: true },
      ctaHref: linkPickerField,
      sticky: {
        type: "radio" as const,
        options: [
          { label: "No", value: false },
          { label: "Yes", value: true },
        ],
      },
    },
    defaultProps: {
      logoText: "Your brand",
      logoImageSrc: "",
      links: [
        { label: "Home", href: "/" },
        { label: "About", href: "#about" },
        { label: "Contact", href: "#contact" },
      ],
      ctaLabel: "Get started",
      ctaHref: "/",
      sticky: false,
    },
    render: (props: NavbarProps) => {
      const {
        logoText = "Your brand",
        logoImageSrc = "",
        links = [],
        ctaLabel = "",
        ctaHref = "",
        sticky = false,
      } = props;
      const safeLogoImage = sanitizeMediaUrl(logoImageSrc);
      const safeCtaHref = sanitizeLinkUrl(ctaHref);
      const safeLinks = links
        .map((link) => ({
          label: link.label,
          href: sanitizeLinkUrl(link.href),
          children: (link.children ?? [])
            .map((child) => ({
              label: child.label,
              href: sanitizeLinkUrl(child.href),
            }))
            .filter((child) => child.href),
        }))
        .filter((link) => link.href || link.children.length > 0);

      return (
        <NavbarClient
          logoText={logoText}
          logoImageSrc={safeLogoImage}
          links={safeLinks}
          ctaLabel={ctaLabel}
          ctaHref={safeCtaHref}
          sticky={sticky}
        />
      );
    },
  },

  Footer: {
    label: "Footer",
    fields: {
      columns: {
        type: "array" as const,
        arrayFields: {
          title: { type: "text" as const, contentEditable: true },
          links: {
            type: "array" as const,
            arrayFields: {
              label: { type: "text" as const, contentEditable: true },
              href: linkPickerField,
            },
            getItemSummary: (item: NavLink) => item.label || "Link",
            defaultItemProps: { label: "Link", href: "/" },
          },
        },
        getItemSummary: (item: FooterColumn) => item.title || "Column",
        defaultItemProps: {
          title: "Column",
          links: [{ label: "Link", href: "/" }],
        },
      },
      copyrightText: { type: "text" as const, contentEditable: true },
    },
    defaultProps: {
      columns: [
        {
          title: "Product",
          links: [
            { label: "Features", href: "#" },
            { label: "Pricing", href: "#" },
          ],
        },
        {
          title: "Company",
          links: [
            { label: "About", href: "#" },
            { label: "Contact", href: "#" },
          ],
        },
      ],
      copyrightText: `© ${new Date().getFullYear()} Your brand. All rights reserved.`,
    },
    render: (props: FooterProps) => {
      const { columns = [], copyrightText = "" } = props;

      return (
        <footer className="border-border border-t">
          <div className="mx-auto max-w-6xl px-[var(--spacing-md)] py-10">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
              {columns.map((column, i) => (
                <div key={i}>
                  <p className="text-foreground text-sm font-semibold">
                    {column.title}
                  </p>
                  <ul className="mt-3 space-y-2">
                    {(column.links ?? []).map((link, li) => {
                      const safeHref = sanitizeLinkUrl(link.href);
                      if (!safeHref) return null;
                      return (
                        <li key={li}>
                          <a
                            href={safeHref}
                            className="text-muted-foreground hover:text-foreground text-sm"
                          >
                            {link.label}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
            {copyrightText ? (
              <p className="text-muted-foreground border-border mt-10 border-t pt-6 text-sm">
                {copyrightText}
              </p>
            ) : null}
          </div>
        </footer>
      );
    },
  },

  SocialBar: {
    label: "Social Bar",
    fields: {
      links: {
        type: "array" as const,
        arrayFields: {
          platform: {
            type: "select" as const,
            options: socialPlatforms.map((platform) => ({
              label: platform[0]!.toUpperCase() + platform.slice(1),
              value: platform,
            })),
          },
          href: linkPickerField,
        },
        getItemSummary: (item: SocialLink) => item.platform || "Link",
        defaultItemProps: { platform: "website", href: "/" },
      },
      size: {
        type: "radio" as const,
        options: [
          { label: "SM", value: "sm" },
          { label: "MD", value: "md" },
          { label: "LG", value: "lg" },
        ],
      },
      align: {
        type: "radio" as const,
        options: [
          { label: "Start", value: "start" },
          { label: "Center", value: "center" },
          { label: "End", value: "end" },
        ],
      },
      variant: {
        type: "radio" as const,
        options: [
          { label: "Plain", value: "plain" },
          { label: "Circle", value: "circle" },
        ],
      },
    },
    defaultProps: {
      links: [
        { platform: "twitter", href: "/" },
        { platform: "instagram", href: "/" },
        { platform: "linkedin", href: "/" },
      ],
      size: "md",
      align: "start",
      variant: "circle",
    },
    render: (props: SocialBarProps) => {
      const {
        links = [],
        size = "md",
        align = "start",
        variant = "circle",
      } = props;
      const iconClass = socialIconSizeMap[size] ?? socialIconSizeMap.md;
      const alignClass = socialAlignMap[align] ?? socialAlignMap.start;

      return (
        <div className={`flex flex-wrap items-center gap-2 ${alignClass}`}>
          {links.map((link, i) => {
            const safeHref = sanitizeLinkUrl(link.href);
            const Icon = getSocialIcon(link.platform);
            if (!safeHref || !Icon) return null;
            return (
              <a
                key={i}
                href={safeHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.platform}
                className={
                  variant === "circle"
                    ? "bg-muted text-foreground hover:bg-muted/70 grid size-9 place-items-center rounded-full"
                    : "text-muted-foreground hover:text-foreground"
                }
              >
                <Icon className={iconClass} />
              </a>
            );
          })}
        </div>
      );
    },
  },
};
