"use client";

import { Maximize2Icon, Minimize2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

export function FullscreenToggle() {
  const t = useTranslations("common");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function syncFullscreen() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }

    syncFullscreen();
    document.addEventListener("fullscreenchange", syncFullscreen);

    return () =>
      document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  async function toggleFullscreen() {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await document.documentElement.requestFullscreen();
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isFullscreen ? t("fullscreen.exit") : t("fullscreen.enter")}
      onClick={toggleFullscreen}
    >
      {isFullscreen ? (
        <Minimize2Icon className="size-4" />
      ) : (
        <Maximize2Icon className="size-4" />
      )}
    </Button>
  );
}
