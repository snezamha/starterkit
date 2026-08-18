"use client";

import { useCallback, useRef, useState } from "react";
import { CheckCircle2, FileIcon, Loader2, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useUploadThing } from "@/features/media/uploadthing/client";
import { formatFileSize, isAcceptedMimeType } from "@/features/media/shared";
import { cn } from "@/lib/utils";

const MEDIA_UPLOAD_ACCEPT = "image/*,application/pdf";

type UploadEntry = {
  file: File;
  status: "uploading" | "done" | "error";
  error?: string;
};

type Props = {
  maxSizeMB: number;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  labels: {
    dropZone: string;
    or: string;
    selectFiles: string;
    maxFileSize: string;
    removeUpload: string;
  };
  resolveErrorMessage: (error: string) => string;
  onUploaded?: (uploaded: Array<{ url: string; name: string }>) => void;
  onError?: (message: string) => void;
};

export function MediaDropzone({
  maxSizeMB,
  multiple = true,
  disabled,
  className,
  labels,
  resolveErrorMessage,
  onUploaded,
  onError,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [entries, setEntries] = useState<UploadEntry[]>([]);
  const [progress, setProgress] = useState(0);

  const markPending = useCallback(
    (status: UploadEntry["status"], error?: string) => {
      setEntries((previous) =>
        previous.map((entry) =>
          entry.status === "uploading" ? { ...entry, status, error } : entry,
        ),
      );
    },
    [],
  );

  const { startUpload, isUploading } = useUploadThing("mediaUploader", {
    onUploadProgress: setProgress,
    onClientUploadComplete: (uploaded) => {
      setProgress(0);
      markPending("done");
      onUploaded?.(
        uploaded.map((file) => ({ url: file.ufsUrl, name: file.name })),
      );
    },
    onUploadError: (error) => {
      setProgress(0);
      const message = resolveErrorMessage(error.message || "uploadFailed");
      markPending("error", message);
      onError?.(message);
    },
  });

  const open = useCallback(() => {
    if (!disabled && !isUploading) inputRef.current?.click();
  }, [disabled, isUploading]);

  const handleFiles = useCallback(
    (fileList: FileList | File[] | null) => {
      if (!fileList || fileList.length === 0) return;

      const selected = Array.from(fileList).slice(0, multiple ? undefined : 1);
      const accepted: File[] = [];
      const rejected: UploadEntry[] = [];

      for (const file of selected) {
        if (!isAcceptedMimeType(file.type)) {
          const message = resolveErrorMessage("unsupportedType");
          rejected.push({ file, status: "error", error: message });
          onError?.(message);
          continue;
        }

        if (file.size > maxSizeMB * 1024 * 1024) {
          const message = resolveErrorMessage("fileTooLarge");
          rejected.push({ file, status: "error", error: message });
          onError?.(message);
          continue;
        }

        accepted.push(file);
      }

      setEntries((previous) => [
        ...previous,
        ...rejected,
        ...accepted.map((file): UploadEntry => ({
          file,
          status: "uploading" as const,
        })),
      ]);

      if (accepted.length > 0) {
        void startUpload(accepted);
      }
    },
    [maxSizeMB, multiple, onError, resolveErrorMessage, startUpload],
  );

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled && !isUploading) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          if (!disabled && !isUploading) handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "border-input bg-muted/30 flex flex-col items-center justify-center rounded-lg border border-dashed px-4 py-10 text-center transition-colors",
          isDragging && "border-primary bg-primary/5",
        )}
      >
        <Upload className="text-muted-foreground size-8" />
        <p className="mt-3 text-sm font-medium">{labels.dropZone}</p>
        <p className="text-muted-foreground mt-1 text-xs">{labels.or}</p>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          disabled={disabled || isUploading}
          onClick={open}
        >
          {isUploading ? <Loader2 className="animate-spin" /> : null}
          {labels.selectFiles}
        </Button>
        <p className="text-muted-foreground mt-3 text-xs">
          {labels.maxFileSize}
        </p>
        {isUploading ? (
          <div className="bg-input mt-4 h-1 w-full max-w-xs overflow-hidden rounded-full">
            <div
              className="bg-primary h-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : null}
        <input
          ref={inputRef}
          type="file"
          accept={MEDIA_UPLOAD_ACCEPT}
          multiple={multiple}
          className="hidden"
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {entries.length > 0 ? (
        <ul className="divide-y rounded-lg border">
          {entries.map((entry, index) => (
            <li
              key={`${entry.file.name}-${index}`}
              className="flex items-center gap-3 px-3 py-2 text-sm"
            >
              <FileIcon className="text-muted-foreground size-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium" dir="ltr">
                  {entry.file.name}
                </p>
                <p className="text-muted-foreground text-xs">
                  {formatFileSize(entry.file.size)}
                </p>
                {entry.error ? (
                  <p className="text-destructive text-xs">{entry.error}</p>
                ) : null}
              </div>
              {entry.status === "uploading" ? (
                <Loader2 className="text-muted-foreground size-4 animate-spin" />
              ) : null}
              {entry.status === "done" ? (
                <CheckCircle2 className="text-primary size-4" />
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={labels.removeUpload}
                onClick={() =>
                  setEntries((previous) =>
                    previous.filter((_, position) => position !== index),
                  )
                }
              >
                <X />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
