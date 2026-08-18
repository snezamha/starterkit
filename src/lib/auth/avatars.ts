export const presetAvatars = ["man", "woman"] as const;

export type PresetAvatar = (typeof presetAvatars)[number];

export function presetAvatarSrc(preset: PresetAvatar) {
  return `/avatars/avatar-${preset}.svg`;
}
