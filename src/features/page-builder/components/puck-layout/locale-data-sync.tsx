"use client";

import { useEffect, useRef } from "react";

import type { PuckData } from "@/features/page-builder/puck/config";
import type { Locale } from "@/i18n/config";

import { usePuckSelector } from "./context";

export function LocaleDataSync({
  locale,
  data,
}: {
  locale: Locale;
  data: PuckData;
}) {
  const dispatch = usePuckSelector((s) => s.dispatch);
  const setHistories = usePuckSelector((s) => s.history.setHistories);
  const setHistoryIndex = usePuckSelector((s) => s.history.setHistoryIndex);
  const previousLocale = useRef(locale);
  const dataRef = useRef(data);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    if (previousLocale.current === locale) return;
    previousLocale.current = locale;
    dispatch({
      type: "setData",
      data: dataRef.current,
      recordHistory: false,
    });
    dispatch({ type: "setUi", ui: { itemSelector: null } });
    setHistories([]);
    setHistoryIndex(0);
  }, [locale, dispatch, setHistories, setHistoryIndex]);

  return null;
}
