"use client";

import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import {
  DashboardPage,
  DashboardPageHeader,
} from "@/components/dashboard/layout/dashboard-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MediaDropzone } from "@/features/media/components/media-dropzone";
import { Link } from "@/i18n/navigation";
import { toastManager } from "@/lib/toast-manager";

type Props = {
  maxFileSizeMb: number;
};

export function MediaUploadView({ maxFileSizeMb }: Props) {
  const t = useTranslations("media");
  const router = useRouter();

  return (
    <DashboardPage>
      <DashboardPageHeader
        title={t("uploadTitle")}
        description={t("description")}
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

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t("uploadTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <MediaDropzone
            maxSizeMB={maxFileSizeMb}
            labels={{
              dropZone: t("dropZone"),
              or: t("or"),
              selectFiles: t("selectFiles"),
              maxFileSize: t("maxFileSizeCurrent", {
                size: `${maxFileSizeMb} MB`,
              }),
              removeUpload: t("removeUpload"),
            }}
            resolveErrorMessage={(error) =>
              t(`errors.${error}` as "errors.uploadFailed")
            }
            onUploaded={() => {
              router.refresh();
              toastManager.add({
                title: t("uploadSuccess"),
                type: "success",
                timeout: 3000,
              });
            }}
            onError={(message) =>
              toastManager.add({ title: message, type: "error", timeout: 5000 })
            }
          />
        </CardContent>
      </Card>
    </DashboardPage>
  );
}
