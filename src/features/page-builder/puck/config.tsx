import type { Config, Data } from "@puckeditor/core";
import type { ReactNode } from "react";

import { layoutComponents } from "./components/layout";
import { typographyComponents } from "./components/typography";
import { mediaComponents } from "./components/media";
import { contentComponents } from "./components/content";
import { navigationComponents } from "./components/navigation";
import { siteComponents } from "./components/site";
import { formComponents } from "./components/forms";
import { interactiveComponents } from "./components/interactive";
import { showcaseComponents } from "./components/showcase";
import {
  defaultVisibility,
  getVisibilityClass,
  visibilityField,
  type VisibilitySettings,
} from "./responsive";
import {
  advancedField,
  defaultAdvancedSettings,
  getRoundedClass,
  getShadowClass,
  getSpacingClass,
  type AdvancedSettings,
} from "./block-settings";
import { ScrollReveal } from "./scroll-reveal";

type AnyComponentConfig = {
  fields?: Record<string, unknown>;
  defaultProps?: Record<string, unknown>;
  render: (props: never) => ReactNode;
  [key: string]: unknown;
};

function withVisibilityToggle<T extends Record<string, AnyComponentConfig>>(
  components: T,
) {
  return Object.fromEntries(
    Object.entries(components).map(([name, definition]) => [
      name,
      {
        ...definition,
        fields: {
          ...definition.fields,
          visibility: visibilityField,
          advanced: advancedField,
        },
        defaultProps: {
          ...definition.defaultProps,
          visibility: defaultVisibility,
          advanced: defaultAdvancedSettings,
        },
        render: (props: {
          visibility?: VisibilitySettings;
          advanced?: AdvancedSettings;
          puck?: { isEditing?: boolean };
        }) => {
          const rendered = definition.render(props as never);
          const animation = props.advanced?.animation ?? "none";
          const animated =
            animation !== "none" ? (
              <ScrollReveal
                animation={animation}
                isEditing={props.puck?.isEditing}
              >
                {rendered}
              </ScrollReveal>
            ) : (
              rendered
            );

          const wrapperClass = [
            getVisibilityClass(props.visibility),
            getSpacingClass(props.advanced?.spacing),
            getRoundedClass(props.advanced?.rounded),
            getShadowClass(props.advanced?.shadow),
          ]
            .filter(Boolean)
            .join(" ");

          if (!wrapperClass) return animated;
          return <div className={wrapperClass}>{animated}</div>;
        },
      },
    ]),
  ) as unknown as T;
}

export const puckConfig = {
  root: {
    fields: {},
  },
  categories: {
    basics: {
      title: "Basics",
      components: ["Heading", "RichText", "ButtonLink", "Section"],
      defaultExpanded: true,
    },
    layout: {
      title: "Layout",
      components: [
        "Container",
        "Columns",
        "FlexContainer",
        "Tabs",
        "VerticalSpace",
        "Separator",
      ],
      defaultExpanded: false,
    },
    media: {
      title: "Media",
      components: ["Image", "Gallery", "Video", "Icon"],
      defaultExpanded: false,
    },
    content: {
      title: "Content",
      components: [
        "Card",
        "Stats",
        "Accordion",
        "Alert",
        "Testimonial",
        "Team",
        "Blockquote",
        "List",
        "CodeBlock",
      ],
      defaultExpanded: false,
    },
    site: {
      title: "Site structure",
      components: ["Navbar", "Footer", "SocialBar"],
      defaultExpanded: false,
    },
    forms: {
      title: "Forms",
      components: [
        "Form",
        "InputField",
        "TextareaField",
        "SelectField",
        "CheckboxField",
      ],
      defaultExpanded: false,
    },
  },
  components: withVisibilityToggle({
    ...layoutComponents,
    ...typographyComponents,
    ...mediaComponents,
    ...contentComponents,
    ...navigationComponents,
    ...siteComponents,
    ...formComponents,
    ...interactiveComponents,
    ...showcaseComponents,
  }),
} satisfies Config;

export type PuckConfig = typeof puckConfig;
export type PuckData = Data<PuckConfig["components"]>;
