import type { Locale } from "@/i18n/config";

export type PuckMetadata = {
  locale: Locale;
  emptyImage: string;
  emptyVideo: string;
  invalidVideo: string;
  emptyGallery: string;
  emptyTeam: string;
};

const metadata: Record<Locale, PuckMetadata> = {
  en: {
    locale: "en",
    emptyImage: "No image selected",
    emptyVideo: "No video URL",
    invalidVideo: "Invalid video URL",
    emptyGallery: "No images added yet",
    emptyTeam: "No team members added yet",
  },
  de: {
    locale: "de",
    emptyImage: "Kein Bild ausgewählt",
    emptyVideo: "Keine Video-URL",
    invalidVideo: "Ungültige Video-URL",
    emptyGallery: "Noch keine Bilder hinzugefügt",
    emptyTeam: "Noch keine Teammitglieder hinzugefügt",
  },
  fa: {
    locale: "fa",
    emptyImage: "تصویری انتخاب نشده است",
    emptyVideo: "نشانی ویدیو وارد نشده است",
    invalidVideo: "نشانی ویدیو نامعتبر است",
    emptyGallery: "هنوز تصویری اضافه نشده است",
    emptyTeam: "هنوز عضوی اضافه نشده است",
  },
};

export function getPuckMetadata(locale: Locale) {
  return metadata[locale];
}
