"use client";

import { useEffect, useState } from "react";
import Image, { type ImageLoader } from "next/image";
import { FileTextIcon, Search } from "lucide-react";
import { useTranslations } from "next-intl";

import { SpinnerSection } from "@/components/loading/spinner-section";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMediaUploadLimit, listMediaAssets } from "@/features/media/actions";
import { MediaDropzone } from "@/features/media/components/media-dropzone";
import {
  formatFileSize,
  isImageMimeType,
  type MediaAssetDto,
} from "@/features/media/shared";

const mediaImageLoader: ImageLoader = ({ src }) => src;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
  imagesOnly?: boolean;
};

export function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
  imagesOnly = false,
}: Props) {
  const t = useTranslations("media");
  const [assets, setAssets] = useState<MediaAssetDto[] | null>(null);
  const [maxFileSizeMb, setMaxFileSizeMb] = useState(0);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let active = true;

    void (async () => {
      const [assetResult, limitResult] = await Promise.allSettled([
        listMediaAssets(),
        getMediaUploadLimit(),
      ]);

      if (!active) return;

      if (assetResult.status === "fulfilled") {
        setAssets(assetResult.value);
        setError(null);
      } else {
        setAssets([]);
        setError(t("error"));
      }

      setMaxFileSizeMb(
        limitResult.status === "fulfilled" ? limitResult.value : 0,
      );
    })();

    return () => {
      active = false;
    };
  }, [open, t]);

  function handleSelect(url: string) {
    onSelect(url);
    onOpenChange(false);
  }

  const visibleAssets = (assets ?? []).filter(
    (asset) =>
      (!imagesOnly || isImageMimeType(asset.mimeType)) &&
      asset.filename.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85dvh] flex-col sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t("pickerTitle")}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="library" className="min-h-0 flex-1">
          <TabsList className="w-full">
            <TabsTrigger value="library">{t("pickerLibraryTab")}</TabsTrigger>
            <TabsTrigger value="upload">{t("pickerUploadTab")}</TabsTrigger>
          </TabsList>

          <TabsContent
            value="library"
            className="flex min-h-0 flex-col gap-3 pt-4"
          >
            <div className="relative">
              <Search className="text-muted-foreground absolute start-3 top-1/2 size-4 -translate-y-1/2" />
              <Input
                className="ps-9"
                placeholder={t("searchPlaceholder")}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            {assets === null ? (
              <SpinnerSection className="h-48 w-full" size={24} />
            ) : visibleAssets.length === 0 ? (
              <div className="rounded-lg border px-4 py-8 text-center">
                <p className="text-muted-foreground text-sm">
                  {error ?? (assets.length === 0 ? t("empty") : t("noResults"))}
                </p>
              </div>
            ) : (
              <div className="grid max-h-[50vh] grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-3 overflow-y-auto p-1">
                {visibleAssets.map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    className="hover:border-primary focus-visible:ring-ring/50 overflow-hidden rounded-lg border text-start transition-colors focus-visible:ring-3 focus-visible:outline-none"
                    onClick={() => handleSelect(asset.publicUrl)}
                  >
                    <div className="bg-muted relative grid aspect-square place-items-center overflow-hidden">
                      {isImageMimeType(asset.mimeType) ? (
                        <Image
                          loader={mediaImageLoader}
                          src={asset.publicUrl}
                          alt={asset.alt || asset.filename}
                          fill
                          sizes="8rem"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <FileTextIcon className="text-muted-foreground size-6" />
                      )}
                    </div>
                    <div className="p-2">
                      <p className="truncate text-xs font-medium" dir="ltr">
                        {asset.filename}
                      </p>
                      <p className="text-muted-foreground text-[0.7rem]">
                        {formatFileSize(asset.size)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload" className="pt-4">
            <MediaDropzone
              maxSizeMB={maxFileSizeMb}
              disabled={maxFileSizeMb === 0}
              multiple={false}
              labels={{
                dropZone: t("dropZone"),
                or: t("or"),
                selectFiles: t("selectFiles"),
                maxFileSize: t("maxFileSizeCurrent", {
                  size: `${maxFileSizeMb} MB`,
                }),
                removeUpload: t("removeUpload"),
              }}
              resolveErrorMessage={(key) =>
                t(`errors.${key}` as "errors.uploadFailed")
              }
              onUploaded={(uploaded) => {
                const first = uploaded[0];

                if (first) {
                  handleSelect(first.url);
                }
              }}
              onError={setError}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
