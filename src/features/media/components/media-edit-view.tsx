"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  Crop as CropIcon,
  Download,
  FlipHorizontal,
  FlipVertical,
  Maximize,
  RotateCcw,
  RotateCw,
} from "lucide-react";
import { useTranslations } from "next-intl";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import {
  DashboardCardFormFooter,
  DashboardPage,
  DashboardPageHeader,
} from "@/components/dashboard/layout/dashboard-page";
import { useSiteDateTimeFormat } from "@/components/providers/datetime-format-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  updateMediaImage,
  updateMediaMetadata,
} from "@/features/media/actions";
import {
  formatFileSize,
  isImageMimeType,
  type MediaAssetDto,
} from "@/features/media/shared";
import { Link } from "@/i18n/navigation";
import { toastManager } from "@/lib/toast-manager";

function getAbsoluteUrl(path: string) {
  if (typeof window === "undefined") return path;
  return new URL(path, window.location.origin).toString();
}

export function MediaEditView({ file }: { file: MediaAssetDto }) {
  const t = useTranslations("media");
  const router = useRouter();
  const { formatDateTime } = useSiteDateTimeFormat();
  const [isSavingImage, startImageTransition] = useTransition();
  const [isSavingMetadata, startMetadataTransition] = useTransition();

  const [alt, setAlt] = useState(file.alt);
  const [caption, setCaption] = useState(file.caption);
  const [description, setDescription] = useState(file.description);
  const [credit, setCredit] = useState(file.credit);
  const [metadataBaseline, setMetadataBaseline] = useState({
    alt: file.alt,
    caption: file.caption,
    description: file.description,
    credit: file.credit,
  });

  const imgRef = useRef<HTMLImageElement>(null);
  const [naturalWidth, setNaturalWidth] = useState<number | null>(null);
  const [naturalHeight, setNaturalHeight] = useState<number | null>(null);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [rotation, setRotation] = useState(0);
  const [flipX, setFlipX] = useState(1);
  const [flipY, setFlipY] = useState(1);
  const [resizeDialogOpen, setResizeDialogOpen] = useState(false);
  const [keepRatio, setKeepRatio] = useState(true);
  const [targetWidth, setTargetWidth] = useState("");
  const [targetHeight, setTargetHeight] = useState("");
  const [imageUrl, setImageUrl] = useState(file.publicUrl);

  const permalink = getAbsoluteUrl(imageUrl);
  const isImage = isImageMimeType(file.mimeType);

  const parsedWidth = Number.parseInt(targetWidth, 10);
  const parsedHeight = Number.parseInt(targetHeight, 10);
  const hasResizeInput = targetWidth !== "" || targetHeight !== "";
  const resizeValid =
    !hasResizeInput ||
    (Number.isInteger(parsedWidth) &&
      parsedWidth > 0 &&
      Number.isInteger(parsedHeight) &&
      parsedHeight > 0);

  const hasTransforms =
    rotation !== 0 ||
    flipX !== 1 ||
    flipY !== 1 ||
    !!crop ||
    (resizeValid && hasResizeInput);

  const hasMetadataChanges = useMemo(
    () =>
      alt !== metadataBaseline.alt ||
      caption !== metadataBaseline.caption ||
      description !== metadataBaseline.description ||
      credit !== metadataBaseline.credit,
    [alt, caption, credit, description, metadataBaseline],
  );

  function notifyError(key: string) {
    toastManager.add({
      title: t(`errors.${key}` as "errors.invalid"),
      type: "error",
      timeout: 5000,
    });
  }

  function resetTransforms() {
    setRotation(0);
    setFlipX(1);
    setFlipY(1);
    setCrop(undefined);
    setTargetWidth("");
    setTargetHeight("");
  }

  function resetEditState() {
    setIsEditingImage(false);
    resetTransforms();
  }

  function handleTargetWidthChange(value: string) {
    setTargetWidth(value);
    if (!keepRatio || !naturalWidth || !naturalHeight) return;

    const width = Number.parseInt(value, 10);
    setTargetHeight(
      Number.isInteger(width) && width > 0
        ? String(
            Math.max(1, Math.round((width * naturalHeight) / naturalWidth)),
          )
        : "",
    );
  }

  function handleTargetHeightChange(value: string) {
    setTargetHeight(value);
    if (!keepRatio || !naturalWidth || !naturalHeight) return;

    const height = Number.parseInt(value, 10);
    setTargetWidth(
      Number.isInteger(height) && height > 0
        ? String(
            Math.max(1, Math.round((height * naturalWidth) / naturalHeight)),
          )
        : "",
    );
  }

  function renderEditedCanvas(): HTMLCanvasElement | null {
    const image = imgRef.current;
    if (!image) return null;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const activeCrop = crop && crop.width > 0 && crop.height > 0 ? crop : null;

    const cropWidth = activeCrop
      ? activeCrop.width * scaleX
      : image.naturalWidth;
    const cropHeight = activeCrop
      ? activeCrop.height * scaleY
      : image.naturalHeight;
    const cropX = activeCrop ? activeCrop.x * scaleX : 0;
    const cropY = activeCrop ? activeCrop.y * scaleY : 0;

    const base = document.createElement("canvas");
    base.width = cropWidth;
    base.height = cropHeight;

    const baseContext = base.getContext("2d");
    if (!baseContext) return null;

    baseContext.save();
    baseContext.translate(
      flipX === -1 ? cropWidth : 0,
      flipY === -1 ? cropHeight : 0,
    );
    baseContext.scale(flipX, flipY);
    baseContext.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight,
    );
    baseContext.restore();

    const angle = ((rotation % 360) + 360) % 360;
    let rotated = base;

    if (angle !== 0) {
      const swap = angle === 90 || angle === 270;
      const rotatedCanvas = document.createElement("canvas");
      rotatedCanvas.width = swap ? cropHeight : cropWidth;
      rotatedCanvas.height = swap ? cropWidth : cropHeight;

      const rotatedContext = rotatedCanvas.getContext("2d");
      if (!rotatedContext) return null;

      rotatedContext.translate(
        rotatedCanvas.width / 2,
        rotatedCanvas.height / 2,
      );
      rotatedContext.rotate((angle * Math.PI) / 180);
      rotatedContext.drawImage(base, -cropWidth / 2, -cropHeight / 2);
      rotated = rotatedCanvas;
    }

    if (resizeValid && hasResizeInput) {
      const scaled = document.createElement("canvas");
      scaled.width = parsedWidth;
      scaled.height = parsedHeight;

      const scaledContext = scaled.getContext("2d");
      if (!scaledContext) return null;

      scaledContext.drawImage(rotated, 0, 0, parsedWidth, parsedHeight);
      return scaled;
    }

    return rotated;
  }

  function handleSaveImage() {
    startImageTransition(async () => {
      const canvas = renderEditedCanvas();

      if (!canvas) {
        notifyError("invalid");
        return;
      }

      const mimeType = isImage ? file.mimeType : "image/png";
      const base64Data = canvas.toDataURL(mimeType, 0.9);
      const result = await updateMediaImage(file.id, base64Data, mimeType);

      if (!result.ok) {
        notifyError(result.error ?? "invalid");
        return;
      }

      resetEditState();
      if (result.publicUrl) setImageUrl(result.publicUrl);
      toastManager.add({
        title: t("imageSaved"),
        type: "success",
        timeout: 3000,
      });
      router.refresh();
    });
  }

  function handleSaveMetadata() {
    startMetadataTransition(async () => {
      const result = await updateMediaMetadata(file.id, {
        alt,
        caption,
        description,
        credit,
      });

      if (!result.ok) {
        notifyError(result.error ?? "invalid");
        return;
      }

      setMetadataBaseline({ alt, caption, description, credit });
      toastManager.add({
        title: t("imageSaved"),
        type: "success",
        timeout: 3000,
      });
      router.refresh();
    });
  }

  function handleCancelMetadata() {
    setAlt(metadataBaseline.alt);
    setCaption(metadataBaseline.caption);
    setDescription(metadataBaseline.description);
    setCredit(metadataBaseline.credit);
  }

  return (
    <DashboardPage>
      <DashboardPageHeader
        title={t("editTitle")}
        description={
          <span className="block truncate" dir="ltr">
            {file.filename}
          </span>
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/dashboard/media" />}
          >
            <ArrowLeft className="size-4 rtl:rotate-180" />
            {t("backToLibrary")}
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t("permalink")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <p
                  className="text-muted-foreground min-w-0 flex-1 truncate font-mono text-sm"
                  dir="ltr"
                >
                  {permalink}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={async () => {
                    await navigator.clipboard.writeText(permalink);
                    toastManager.add({
                      title: t("copySuccess"),
                      type: "success",
                      timeout: 3000,
                    });
                  }}
                >
                  <Copy className="size-4" />
                  {t("copy")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {isImage ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t("editImage")}</CardTitle>
              </CardHeader>
              <CardContent>
                {!isEditingImage ? (
                  <div className="space-y-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt={alt || file.filename}
                      className="aspect-video w-full rounded-lg object-contain"
                    />
                    <Button
                      type="button"
                      onClick={() => setIsEditingImage(true)}
                    >
                      {t("editImage")}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCrop({
                            unit: "%",
                            width: 50,
                            height: 50,
                            x: 25,
                            y: 25,
                          })
                        }
                      >
                        <CropIcon className="size-4" />
                        {t("crop")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setRotation((value) => (value + 90) % 360)
                        }
                      >
                        <RotateCw className="size-4" />
                        {t("rotate")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFlipX((value) => value * -1)}
                      >
                        <FlipHorizontal className="size-4" />
                        {t("flipH")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFlipY((value) => value * -1)}
                      >
                        <FlipVertical className="size-4" />
                        {t("flipV")}
                      </Button>
                      <Dialog
                        open={resizeDialogOpen}
                        onOpenChange={setResizeDialogOpen}
                      >
                        <DialogTrigger
                          render={
                            <Button type="button" variant="outline" size="sm" />
                          }
                        >
                          <Maximize className="size-4" />
                          {t("scale")}
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{t("scale")}</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="targetWidth">
                                {t("widthPx")}
                              </Label>
                              <Input
                                id="targetWidth"
                                type="number"
                                min={1}
                                placeholder={
                                  naturalWidth ? String(naturalWidth) : ""
                                }
                                value={targetWidth}
                                onChange={(event) =>
                                  handleTargetWidthChange(event.target.value)
                                }
                                dir="ltr"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="targetHeight">
                                {t("heightPx")}
                              </Label>
                              <Input
                                id="targetHeight"
                                type="number"
                                min={1}
                                placeholder={
                                  naturalHeight ? String(naturalHeight) : ""
                                }
                                value={targetHeight}
                                onChange={(event) =>
                                  handleTargetHeightChange(event.target.value)
                                }
                                dir="ltr"
                              />
                            </div>
                            <Label className="text-sm font-normal">
                              <Checkbox
                                checked={keepRatio}
                                onCheckedChange={(checked) =>
                                  setKeepRatio(checked === true)
                                }
                              />
                              {t("keepRatio")}
                            </Label>
                          </div>
                          <DialogFooter>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setTargetWidth("");
                                setTargetHeight("");
                                setResizeDialogOpen(false);
                              }}
                            >
                              {t("cancel")}
                            </Button>
                            <Button
                              type="button"
                              disabled={!resizeValid || !hasResizeInput}
                              onClick={() => setResizeDialogOpen(false)}
                            >
                              {t("applyChanges")}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!hasTransforms}
                        onClick={resetTransforms}
                      >
                        <RotateCcw className="size-4" />
                        {t("resetEdits")}
                      </Button>
                    </div>

                    <div className="bg-muted/30 grid place-items-center overflow-hidden rounded-lg p-2">
                      <ReactCrop
                        crop={crop}
                        onChange={(pixelCrop) => setCrop(pixelCrop)}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          ref={imgRef}
                          src={imageUrl}
                          alt={alt || file.filename}
                          crossOrigin="anonymous"
                          onLoad={(event) => {
                            setNaturalWidth(event.currentTarget.naturalWidth);
                            setNaturalHeight(event.currentTarget.naturalHeight);
                          }}
                          style={{
                            transform: `rotate(${rotation}deg) scaleX(${flipX}) scaleY(${flipY})`,
                            maxHeight: "60vh",
                          }}
                        />
                      </ReactCrop>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetEditState}
                      >
                        {t("cancel")}
                      </Button>
                      <Button
                        type="button"
                        disabled={isSavingImage || !hasTransforms}
                        onClick={handleSaveImage}
                      >
                        {isSavingImage ? t("saving") : t("saveEdits")}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t("fileDetails")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="alt">{t("altText")}</Label>
                <Input
                  id="alt"
                  value={alt}
                  onChange={(event) => setAlt(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="caption">{t("caption")}</Label>
                <Textarea
                  id="caption"
                  value={caption}
                  onChange={(event) => setCaption(event.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">{t("fileDescription")}</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={6}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="credit">{t("credit")}</Label>
                <Input
                  id="credit"
                  value={credit}
                  onChange={(event) => setCredit(event.target.value)}
                />
              </div>
            </CardContent>
            <DashboardCardFormFooter
              cancelLabel={t("cancel")}
              saveLabel={t("update")}
              status={hasMetadataChanges ? t("unsavedChanges") : null}
              isDirty={hasMetadataChanges}
              isSaving={isSavingMetadata}
              onCancel={handleCancelMetadata}
              onSave={handleSaveMetadata}
            />
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-sm">{t("fileInfo")}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-muted-foreground">{t("uploadedOn")}</dt>
                <dd>{formatDateTime(file.createdAt)}</dd>
              </div>
              {file.uploadedBy ? (
                <div>
                  <dt className="text-muted-foreground">{t("uploadedBy")}</dt>
                  <dd>{file.uploadedBy.name || file.uploadedBy.email}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-muted-foreground">{t("fileType")}</dt>
                <dd dir="ltr">{file.mimeType}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("fileSize")}</dt>
                <dd>{formatFileSize(file.size)}</dd>
              </div>
              {naturalWidth && naturalHeight ? (
                <div>
                  <dt className="text-muted-foreground">{t("dimensions")}</dt>
                  <dd dir="ltr">
                    {naturalWidth} x {naturalHeight}
                  </dd>
                </div>
              ) : null}
            </dl>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              nativeButton={false}
              render={
                <a href={imageUrl} download={file.filename} target="_blank" />
              }
            >
              <Download className="size-4" />
              {t("download")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardPage>
  );
}
