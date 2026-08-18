"use client";

import {
  createContext,
  use,
  useCallback,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  consentCookieMaxAge,
  consentCookieName,
  isConsentCurrent,
  parseConsentCookie,
  serializeConsentCookie,
  type ConsentCategory,
  type ConsentValue,
} from "@/lib/consent/cookie";

const CONSENT_EVENT = "cookie-consent-change";

type ConsentContextValue = {
  hydrated: boolean;
  value: ConsentValue | null;
  answered: boolean;
  bannerOpen: boolean;
  openBanner: () => void;
  closeBanner: () => void;
  save: (categories: Record<ConsentCategory, boolean>) => void;
  isAllowed: (category: ConsentCategory) => boolean;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

function readRawCookie(): string {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${consentCookieName}=([^;]*)`),
  );

  return match ? match[1] : "";
}

function subscribe(onChange: () => void) {
  window.addEventListener(CONSENT_EVENT, onChange);
  return () => window.removeEventListener(CONSENT_EVENT, onChange);
}

export function ConsentProvider({
  children,
  version,
}: {
  children: ReactNode;
  version: number;
}) {
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const raw = useSyncExternalStore(subscribe, readRawCookie, () => "");
  const [reopened, setReopened] = useState(false);

  const value = useMemo(() => {
    const parsed = parseConsentCookie(raw);

    return isConsentCurrent(parsed, version) ? parsed : null;
  }, [raw, version]);

  const save = useCallback(
    (categories: Record<ConsentCategory, boolean>) => {
      const next: ConsentValue = {
        version,
        timestamp: Math.floor(Date.now() / 1000),
        categories,
      };
      const secure = window.location.protocol === "https:" ? "; Secure" : "";

      document.cookie = `${consentCookieName}=${serializeConsentCookie(next)}; Path=/; Max-Age=${consentCookieMaxAge}; SameSite=Lax${secure}`;
      setReopened(false);
      window.dispatchEvent(new Event(CONSENT_EVENT));
    },
    [version],
  );

  const contextValue = useMemo<ConsentContextValue>(() => {
    const answered = value !== null;

    return {
      hydrated,
      value,
      answered,
      bannerOpen: hydrated && (!answered || reopened),
      openBanner: () => setReopened(true),
      closeBanner: () => setReopened(false),
      save,
      isAllowed: (category) => value?.categories[category] === true,
    };
  }, [hydrated, value, reopened, save]);

  return <ConsentContext value={contextValue}>{children}</ConsentContext>;
}

export function useConsent() {
  const context = use(ConsentContext);

  if (!context) {
    throw new Error("useConsent must be used within a ConsentProvider");
  }

  return context;
}

export function useConsentAllowed(category: ConsentCategory) {
  const context = use(ConsentContext);

  return context?.isAllowed(category) ?? false;
}
