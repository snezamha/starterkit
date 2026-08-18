import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function BaseIcon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

const Twitter = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M21 4.5c-.8.4-1.6.6-2.5.7a4.4 4.4 0 0 0 1.9-2.4 8.7 8.7 0 0 1-2.8 1.1 4.4 4.4 0 0 0-7.5 4 12.4 12.4 0 0 1-9-4.6 4.4 4.4 0 0 0 1.4 5.9 4.4 4.4 0 0 1-2-.5v.1a4.4 4.4 0 0 0 3.5 4.3 4.4 4.4 0 0 1-2 .1 4.4 4.4 0 0 0 4.1 3.1A8.8 8.8 0 0 1 2 18.6a12.4 12.4 0 0 0 6.7 2c8.1 0 12.5-6.7 12.5-12.5v-.6c.9-.6 1.6-1.3 2.2-2.1Z" />
  </BaseIcon>
);

const Facebook = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v6h3v-6h3l1-3h-4v-2c0-.6.4-1 1-1Z" />
  </BaseIcon>
);

const Instagram = (props: IconProps) => (
  <BaseIcon {...props}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17" cy="7" r="0.6" fill="currentColor" stroke="none" />
  </BaseIcon>
);

const Linkedin = (props: IconProps) => (
  <BaseIcon {...props}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
    <line x1="7.5" y1="10" x2="7.5" y2="16.5" />
    <circle cx="7.5" cy="7" r="0.9" fill="currentColor" stroke="none" />
    <path d="M11.5 16.5V10M11.5 12.8c0-1.5 1-2.8 2.5-2.8s2.5 1 2.5 2.8v3.7" />
  </BaseIcon>
);

const Youtube = (props: IconProps) => (
  <BaseIcon {...props}>
    <rect x="2.5" y="6" width="19" height="12" rx="4" />
    <path d="M10.5 9.5v5l4.5-2.5-4.5-2.5Z" fill="currentColor" stroke="none" />
  </BaseIcon>
);

const Github = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.3-3.4-1.3-.5-1.1-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.7.4-1.1.6-1.4-2.2-.2-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.2-.5-1.3.1-2.7 0 0 .8-.3 2.7 1a9.3 9.3 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.5.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.8-4.6 5 .3.3.6.9.6 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2Z" />
  </BaseIcon>
);

const Tiktok = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M15 3v9.5a3.5 3.5 0 1 1-3.5-3.5" />
    <path d="M15 3c.3 2 1.8 3.5 3.8 3.7" />
  </BaseIcon>
);

const Whatsapp = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M7 17.5 5 20l2.6-.7A8 8 0 1 0 5 12a7.9 7.9 0 0 0 1 3.9L7 17.5Z" />
    <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5.6 0 .9-.4.7-1l-.5-1.3a.7.7 0 0 0-.8-.4l-1 .3a4 4 0 0 1-2.5-2.5l.3-1a.7.7 0 0 0-.4-.8L9 8c-.6-.2-1 .1-1 .7v.8Z" />
  </BaseIcon>
);

const Telegram = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="m3 11 17-7-3 16-6-4.5L7.5 19 8 14l9-9-12 6.5Z" />
  </BaseIcon>
);

const Pinterest = (props: IconProps) => (
  <BaseIcon {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 19c1-2.5 1.8-5.4 2.2-7 .3 1 1.4 1.7 2.4 1.7 2 0 3.4-1.9 3.4-4.2 0-2-1.5-3.9-4.3-3.9-3.5 0-5.2 2.5-5.2 4.7 0 1 .4 2 1.2 2.6" />
  </BaseIcon>
);

const Discord = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M7.5 6.5C6 7 5 9 4.5 12c-.5 3 .3 5 1.5 6 1 .8 2.3 1.2 2.3 1.2l.7-1.4M16.5 6.5C18 7 19 9 19.5 12c.5 3-.3 5-1.5 6-1 .8-2.3 1.2-2.3 1.2l-.7-1.4" />
    <ellipse
      cx="9"
      cy="12.5"
      rx="1.1"
      ry="1.3"
      fill="currentColor"
      stroke="none"
    />
    <ellipse
      cx="15"
      cy="12.5"
      rx="1.1"
      ry="1.3"
      fill="currentColor"
      stroke="none"
    />
  </BaseIcon>
);

const Website = (props: IconProps) => (
  <BaseIcon {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.5 3.8 5.7 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.7-3.8-9S9.5 5.5 12 3Z" />
  </BaseIcon>
);

const socialIconRegistry = {
  twitter: Twitter,
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  github: Github,
  tiktok: Tiktok,
  whatsapp: Whatsapp,
  telegram: Telegram,
  pinterest: Pinterest,
  discord: Discord,
  website: Website,
} satisfies Record<string, (props: IconProps) => React.ReactElement>;

export type SocialPlatform = keyof typeof socialIconRegistry;

export const socialPlatforms = Object.keys(
  socialIconRegistry,
) as SocialPlatform[];

export function getSocialIcon(platform: string) {
  return socialIconRegistry[platform as SocialPlatform];
}
