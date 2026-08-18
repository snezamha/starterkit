"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import Image, { type ImageLoader } from "next/image";
import { useRouter } from "next/navigation";
import {
  Edit,
  FileIcon,
  FileTextIcon,
  Grid2X2,
  List,
  Loader2,
  Plus,
  Search,
  Settings2,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";

import {
  DashboardPage,
  DashboardPageHeader,
} from "@/components/dashboard/layout/dashboard-page";
import { useSiteDateTimeFormat } from "@/components/providers/datetime-format-provider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deleteMedia } from "@/features/media/actions";
import {
  formatFileSize,
  isImageMimeType,
  type MediaAssetDto,
} from "@/features/media/shared";
import { Link } from "@/i18n/navigation";
import { toastManager } from "@/lib/toast-manager";

const VIEW_MODE_STORAGE_KEY = "media:view-mode";
const VIEW_MODE_EVENT = "media:view-mode-change";
const mediaImageLoader: ImageLoader = ({ src }) => src;

type ViewMode = "grid" | "list";
type TypeFilter = "all" | "image" | "document";

function subscribeViewMode(onStoreChange: () => void) {
  window.addEventListener(VIEW_MODE_EVENT, onStoreChange);
  return () => window.removeEventListener(VIEW_MODE_EVENT, onStoreChange);
}

function getViewModeSnapshot(): ViewMode {
  return window.localStorage.getItem(VIEW_MODE_STORAGE_KEY) === "list"
    ? "list"
    : "grid";
}

function getServerViewModeSnapshot(): ViewMode {
  return "grid";
}

function matchesTypeFilter(mimeType: string, filter: TypeFilter) {
  if (filter === "all") return true;
  if (filter === "image") return isImageMimeType(mimeType);
  return !isImageMimeType(mimeType);
}

function FileTypeIcon({
  mimeType,
  className,
}: {
  mimeType: string;
  className?: string;
}) {
  const Icon = mimeType === "application/pdf" ? FileTextIcon : FileIcon;
  return <Icon className={className} />;
}

type Props = {
  assets: MediaAssetDto[];
  currentUserId: string;
  isAdmin: boolean;
};

export function MediaLibraryView({ assets, currentUserId, isAdmin }: Props) {
  const t = useTranslations("media");
  const router = useRouter();
  const { formatDate } = useSiteDateTimeFormat();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<TypeFilter>("all");
  const [deleteTarget, setDeleteTarget] = useState<MediaAssetDto | null>(null);
  const [previewTarget, setPreviewTarget] = useState<MediaAssetDto | null>(
    null,
  );
  const viewMode = useSyncExternalStore(
    subscribeViewMode,
    getViewModeSnapshot,
    getServerViewModeSnapshot,
  );

  const canManage = (file: MediaAssetDto) =>
    isAdmin || file.uploadedById === currentUserId;

  function changeViewMode(mode: ViewMode) {
    window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
    window.dispatchEvent(new Event(VIEW_MODE_EVENT));
  }

  const filteredFiles = assets.filter(
    (file) =>
      file.filename.toLowerCase().includes(search.toLowerCase()) &&
      matchesTypeFilter(file.mimeType, filterType),
  );

  function handleDelete() {
    if (!deleteTarget) return;

    startDeleteTransition(async () => {
      const result = await deleteMedia(deleteTarget.id);
      setDeleteTarget(null);

      if (result.ok) {
        toastManager.add({
          title: t("deleteSuccess"),
          type: "success",
          timeout: 3000,
        });
        router.refresh();
        return;
      }

      toastManager.add({
        title: t(`errors.${result.error ?? "notFound"}` as "errors.notFound"),
        type: "error",
        timeout: 5000,
      });
    });
  }

  return (
    <DashboardPage>
      <DashboardPageHeader
        title={t("libraryTitle")}
        description={t("description")}
        actions={
          <>
            {isAdmin ? (
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link href="/dashboard/media/settings" />}
              >
                <Settings2 className="size-4" />
                {t("settingsButton")}
              </Button>
            ) : null}
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href="/dashboard/media/upload" />}
            >
              <Plus className="size-4" />
              {t("addButton")}
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="text-muted-foreground absolute start-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            className="ps-9"
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Select
          value={filterType}
          onValueChange={(value) =>
            setFilterType((value as TypeFilter) ?? "all")
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t("allTypes")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allTypes")}</SelectItem>
            <SelectItem value="image">{t("images")}</SelectItem>
            <SelectItem value="document">{t("documents")}</SelectItem>
          </SelectContent>
        </Select>

        <div className="ms-auto flex gap-1">
          <Button
            type="button"
            size="icon-sm"
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => changeViewMode("list")}
            aria-label={t("listView")}
          >
            <List className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant={viewMode === "grid" ? "default" : "outline"}
            onClick={() => changeViewMode("grid")}
            aria-label={t("gridView")}
          >
            <Grid2X2 className="size-4" />
          </Button>
        </div>
      </div>

      {filteredFiles.length === 0 ? (
        <div className="rounded-lg border px-4 py-8 text-center">
          <p className="text-muted-foreground text-sm">
            {assets.length === 0 ? t("empty") : t("noResults")}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(9rem,12rem))] justify-start gap-3">
          {filteredFiles.map((file) => (
            <div key={file.id} className="overflow-hidden rounded-lg border">
              <div className="bg-muted relative grid aspect-square place-items-center overflow-hidden">
                {isImageMimeType(file.mimeType) ? (
                  <button
                    type="button"
                    className="relative block size-full cursor-zoom-in"
                    onClick={() => setPreviewTarget(file)}
                    aria-label={t("preview", { name: file.filename })}
                  >
                    <Image
                      loader={mediaImageLoader}
                      src={file.publicUrl}
                      alt={file.alt || file.filename}
                      fill
                      sizes="12rem"
                      className="object-cover"
                      unoptimized
                    />
                  </button>
                ) : (
                  <FileTypeIcon
                    mimeType={file.mimeType}
                    className="text-muted-foreground size-8"
                  />
                )}
              </div>
              <div className="flex flex-col gap-2 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium" dir="ltr">
                    {file.filename}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                {canManage(file) ? (
                  <div className="flex items-center justify-start gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      nativeButton={false}
                      render={
                        <Link href={`/dashboard/media/${file.id}/edit`} />
                      }
                      aria-label={t("edit")}
                    >
                      <Edit className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setDeleteTarget(file)}
                      aria-label={t("delete")}
                    >
                      <Trash2 className="text-destructive size-4" />
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-3 py-2 text-start">{t("name")}</th>
                  <th className="px-3 py-2 text-start">{t("type")}</th>
                  <th className="px-3 py-2 text-start">{t("size")}</th>
                  <th className="px-3 py-2 text-start">{t("date")}</th>
                  <th className="px-3 py-2 text-start" />
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map((file) => (
                  <tr key={file.id} className="border-b last:border-b-0">
                    <td className="px-3 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        {isImageMimeType(file.mimeType) ? (
                          <button
                            type="button"
                            className="relative size-10 shrink-0 cursor-zoom-in overflow-hidden rounded"
                            onClick={() => setPreviewTarget(file)}
                            aria-label={t("preview", { name: file.filename })}
                          >
                            <Image
                              loader={mediaImageLoader}
                              src={file.publicUrl}
                              alt={file.alt || file.filename}
                              fill
                              sizes="2.5rem"
                              className="object-cover"
                              unoptimized
                            />
                          </button>
                        ) : (
                          <div className="bg-muted grid size-10 shrink-0 place-items-center rounded">
                            <FileTypeIcon
                              mimeType={file.mimeType}
                              className="size-4"
                            />
                          </div>
                        )}
                        <span className="truncate font-medium" dir="ltr">
                          {file.filename}
                        </span>
                      </div>
                    </td>
                    <td className="text-muted-foreground px-3 py-3">
                      {isImageMimeType(file.mimeType)
                        ? t("images")
                        : t("documents")}
                    </td>
                    <td className="text-muted-foreground px-3 py-3">
                      {formatFileSize(file.size)}
                    </td>
                    <td className="text-muted-foreground px-3 py-3">
                      {formatDate(file.createdAt)}
                    </td>
                    <td className="px-3 py-3">
                      {canManage(file) ? (
                        <div className="flex justify-start gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            nativeButton={false}
                            render={
                              <Link href={`/dashboard/media/${file.id}/edit`} />
                            }
                            aria-label={t("edit")}
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setDeleteTarget(file)}
                            aria-label={t("delete")}
                          >
                            <Trash2 className="text-destructive size-4" />
                          </Button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog
        open={!!previewTarget}
        onOpenChange={(open) => {
          if (!open) setPreviewTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="truncate pe-6" dir="ltr">
              {previewTarget?.filename}
            </DialogTitle>
          </DialogHeader>
          {previewTarget ? (
            <div className="relative h-[70vh] w-full overflow-hidden rounded-lg">
              <Image
                loader={mediaImageLoader}
                src={previewTarget.publicUrl}
                alt={previewTarget.alt || previewTarget.filename}
                fill
                sizes="(max-width: 768px) 100vw, 48rem"
                className="object-contain"
                unoptimized
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription dir="ltr">
              {deleteTarget?.filename}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault();
                handleDelete();
              }}
            >
              {isDeleting ? <Loader2 className="size-4 animate-spin" /> : null}
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardPage>
  );
}
