"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

type ThemeMode = "light" | "dark" | "system";

function resolveTheme(theme: ThemeMode) {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  return theme;
}

function applyTheme(theme: ThemeMode) {
  const resolvedTheme = resolveTheme(theme);
  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("theme", theme);
  window.dispatchEvent(new CustomEvent("themechange", { detail: theme }));
}

function getStoredTheme(): ThemeMode {
  const theme = localStorage.getItem("theme");
  return theme === "light" || theme === "dark" || theme === "system"
    ? theme
    : "system";
}

function useThemeMode() {
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    function syncTheme() {
      const nextTheme = getStoredTheme();
      setThemeState(nextTheme);
      setResolvedTheme(resolveTheme(nextTheme));
    }

    syncTheme();
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", syncTheme);
    window.addEventListener("themechange", syncTheme);

    return () => {
      mediaQuery.removeEventListener("change", syncTheme);
      window.removeEventListener("themechange", syncTheme);
    };
  }, []);

  function setTheme(theme: ThemeMode) {
    applyTheme(theme);
    setThemeState(theme);
    setResolvedTheme(resolveTheme(theme));
  }

  return { theme, resolvedTheme, setTheme };
}

export function ThemeToggle() {
  const t = useTranslations("common");
  const { resolvedTheme, setTheme } = useThemeMode();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t("theme.toggle")}
      className="relative"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      suppressHydrationWarning
    >
      <SunIcon
        aria-hidden
        className="size-4 scale-100 rotate-0 transition-transform dark:scale-0 dark:-rotate-90"
      />
      <MoonIcon
        aria-hidden
        className="absolute size-4 scale-0 rotate-90 transition-transform dark:scale-100 dark:rotate-0"
      />
    </Button>
  );
}
