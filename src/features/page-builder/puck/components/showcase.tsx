import { linkPickerField } from "@/features/page-builder/puck/fields/link-picker";
import { mediaPickerField } from "@/features/page-builder/puck/fields/media-picker";
import {
  getResponsiveColumnsClass,
  responsiveColumnsField,
  type ResponsiveColumns,
} from "@/features/page-builder/puck/responsive";
import {
  sanitizeLinkUrl,
  sanitizeMediaUrl,
} from "@/features/page-builder/puck/safety";
import type { PuckRenderProps } from "@/features/page-builder/puck/render-types";

type GalleryItem = { src: string; alt: string; caption: string };
type GalleryProps = PuckRenderProps & {
  items?: GalleryItem[];
  responsiveColumns?: Partial<ResponsiveColumns>;
  aspectRatio?: string;
  hoverEffect?: string;
  rounded?: string;
};

type TeamMember = {
  photo: string;
  name: string;
  role: string;
  bio: string;
  link: string;
};
type TeamProps = PuckRenderProps & {
  members?: TeamMember[];
  responsiveColumns?: Partial<ResponsiveColumns>;
  align?: string;
};

const galleryAspectMap: Record<string, string> = {
  "1/1": "aspect-square",
  "4/3": "aspect-[4/3]",
  "16/9": "aspect-video",
  "3/4": "aspect-[3/4]",
};

const galleryHoverMap: Record<string, string> = {
  none: "",
  zoom: "transition-transform duration-300 group-hover:scale-105",
  fade: "transition-opacity duration-300 group-hover:opacity-75",
  lift: "transition-transform duration-300 group-hover:-translate-y-1",
};

const galleryRoundedMap: Record<string, string> = {
  none: "",
  md: "rounded-[var(--radius-md)]",
  lg: "rounded-[var(--radius-lg)]",
};

const teamAlignMap: Record<string, string> = {
  start: "items-start text-start",
  center: "items-center text-center",
};

export const showcaseComponents = {
  Gallery: {
    label: "Gallery",
    fields: {
      items: {
        type: "array" as const,
        arrayFields: {
          src: mediaPickerField,
          alt: { type: "text" as const },
          caption: { type: "text" as const },
        },
        getItemSummary: (item: GalleryItem, index?: number) =>
          item.caption || item.alt || `Image ${(index ?? 0) + 1}`,
      },
      responsiveColumns: responsiveColumnsField,
      aspectRatio: {
        type: "radio" as const,
        options: [
          { label: "1:1", value: "1/1" },
          { label: "4:3", value: "4/3" },
          { label: "16:9", value: "16/9" },
          { label: "3:4", value: "3/4" },
        ],
      },
      hoverEffect: {
        type: "select" as const,
        options: [
          { label: "None", value: "none" },
          { label: "Zoom", value: "zoom" },
          { label: "Fade", value: "fade" },
          { label: "Lift", value: "lift" },
        ],
      },
      rounded: {
        type: "radio" as const,
        options: [
          { label: "None", value: "none" },
          { label: "Medium", value: "md" },
          { label: "Large", value: "lg" },
        ],
      },
    },
    defaultProps: {
      items: [],
      responsiveColumns: { desktop: "3", tablet: "2", mobile: "1" },
      aspectRatio: "1/1",
      hoverEffect: "zoom",
      rounded: "lg",
    },
    render: (props: GalleryProps) => {
      const {
        items = [],
        responsiveColumns,
        aspectRatio = "1/1",
        hoverEffect = "zoom",
        rounded = "lg",
        puck,
      } = props;
      const visibleItems = items
        .map((item) => ({ ...item, safeSrc: sanitizeMediaUrl(item.src) }))
        .filter((item) => item.safeSrc);

      if (visibleItems.length === 0) {
        return (
          <div className="border-border text-muted-foreground flex min-h-32 items-center justify-center rounded-xl border border-dashed text-sm">
            {puck.metadata.emptyGallery ?? "No images added yet"}
          </div>
        );
      }

      const aspectClass =
        galleryAspectMap[aspectRatio] ?? galleryAspectMap["1/1"];
      const hoverClass = galleryHoverMap[hoverEffect] ?? "";
      const roundedClass = galleryRoundedMap[rounded] ?? galleryRoundedMap.lg;

      return (
        <div
          className={`grid gap-4 ${getResponsiveColumnsClass(responsiveColumns)}`}
        >
          {visibleItems.map((item, index) => (
            <figure key={index} className="group space-y-2">
              <div className={`${aspectClass} ${roundedClass} overflow-hidden`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.safeSrc}
                  alt={item.alt}
                  className={`h-full w-full object-cover ${hoverClass}`}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              {item.caption ? (
                <figcaption className="text-muted-foreground text-center text-sm">
                  {item.caption}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      );
    },
  },

  Team: {
    label: "Team",
    fields: {
      members: {
        type: "array" as const,
        arrayFields: {
          photo: mediaPickerField,
          name: { type: "text" as const },
          role: { type: "text" as const },
          bio: { type: "textarea" as const },
          link: linkPickerField,
        },
        getItemSummary: (item: TeamMember, index?: number) =>
          item.name || `Member ${(index ?? 0) + 1}`,
      },
      responsiveColumns: responsiveColumnsField,
      align: {
        type: "radio" as const,
        options: [
          { label: "Start", value: "start" },
          { label: "Center", value: "center" },
        ],
      },
    },
    defaultProps: {
      members: [],
      responsiveColumns: { desktop: "3", tablet: "2", mobile: "1" },
      align: "center",
    },
    render: (props: TeamProps) => {
      const { members = [], responsiveColumns, align = "center", puck } = props;

      if (members.length === 0) {
        return (
          <div className="border-border text-muted-foreground flex min-h-32 items-center justify-center rounded-xl border border-dashed text-sm">
            {puck.metadata.emptyTeam ?? "No team members added yet"}
          </div>
        );
      }

      const alignClass = teamAlignMap[align] ?? teamAlignMap.center;

      return (
        <div
          className={`grid gap-8 ${getResponsiveColumnsClass(responsiveColumns)}`}
        >
          {members.map((member, index) => {
            const safePhoto = sanitizeMediaUrl(member.photo);
            const safeLink = sanitizeLinkUrl(member.link);
            const name = safeLink ? (
              <a
                href={safeLink}
                className="hover:text-primary transition-colors"
              >
                {member.name}
              </a>
            ) : (
              member.name
            );

            return (
              <div key={index} className={`flex flex-col gap-3 ${alignClass}`}>
                {safePhoto ? (
                  <div className="size-24 overflow-hidden rounded-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={safePhoto}
                      alt={member.name}
                      className="size-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ) : (
                  <div className="bg-muted size-24 rounded-full" />
                )}
                <div className="space-y-1">
                  {member.name ? (
                    <h3 className="text-foreground text-base font-semibold">
                      {name}
                    </h3>
                  ) : null}
                  {member.role ? (
                    <p className="text-primary text-sm font-medium">
                      {member.role}
                    </p>
                  ) : null}
                </div>
                {member.bio ? (
                  <p className="text-muted-foreground text-sm leading-6">
                    {member.bio}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      );
    },
  },
};
