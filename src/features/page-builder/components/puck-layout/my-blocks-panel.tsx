"use client";

import { useContext, useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Plus, Trash2 } from "lucide-react";

import {
  deleteSavedBlock,
  listSavedBlocks,
} from "@/features/page-builder/actions";
import { ROOT_ZONE } from "@/features/page-builder/puck/constants";
import {
  regenerateComponentIds,
  type SavedComponentData,
} from "@/features/page-builder/puck/id-utils";
import { Button } from "@/components/ui/button";
import { toastManager } from "@/lib/toast-manager";

import {
  PUCK_BORDER,
  PUCK_MUTED,
  PuckEditorContext,
  usePuckSelector,
} from "./context";

type SavedBlockRecord = { id: string; name: string; data: unknown };

export function MyBlocksPanel() {
  const t = useTranslations("pageBuilder.builder");
  const ctx = useContext(PuckEditorContext);
  const dispatch = usePuckSelector((s) => s.dispatch);
  const contentLength = usePuckSelector((s) => s.appState.data.content.length);
  const [blocks, setBlocks] = useState<SavedBlockRecord[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!ctx) return;
    startTransition(async () => {
      try {
        const list = await listSavedBlocks();
        setBlocks(list);
      } catch {
        toastManager.add({
          title: t("blocksLoadFailed"),
          type: "error",
          timeout: 5000,
        });
      }
    });
  }, [ctx, t]);

  function handleInsert(block: SavedBlockRecord) {
    if (!block.data || typeof block.data !== "object") return;
    const fresh = regenerateComponentIds(block.data as SavedComponentData);
    dispatch({
      type: "setData",
      data: (previous) => ({ content: [...previous.content, fresh] }),
      recordHistory: true,
    });
    dispatch({
      type: "setUi",
      ui: { itemSelector: { index: contentLength, zone: ROOT_ZONE } },
    });
  }

  function handleDelete(block: SavedBlockRecord) {
    if (!ctx) return;
    setDeletingId(block.id);
    startTransition(async () => {
      try {
        await deleteSavedBlock(block.id);
        setBlocks(
          (current) => current?.filter((b) => b.id !== block.id) ?? null,
        );
      } catch {
        toastManager.add({
          title: t("blockDeleteFailed"),
          type: "error",
          timeout: 5000,
        });
      } finally {
        setDeletingId(null);
      }
    });
  }

  if (!blocks) {
    return (
      <div style={{ padding: 16, textAlign: "center" }}>
        <Loader2 className="animate-spin" size={16} />
      </div>
    );
  }

  if (blocks.length === 0) {
    return (
      <p
        style={{
          fontSize: 12,
          color: PUCK_MUTED,
          textAlign: "center",
          padding: 16,
        }}
      >
        {t("noSavedBlocks")}
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {blocks.map((block) => (
        <div
          key={block.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            border: PUCK_BORDER,
            borderRadius: 8,
            padding: "6px 10px",
          }}
        >
          <span style={{ flex: 1, fontSize: 12 }}>{block.name}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleInsert(block)}
          >
            <Plus size={14} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={isPending && deletingId === block.id}
            onClick={() => handleDelete(block)}
          >
            {deletingId === block.id ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              <Trash2 size={14} />
            )}
          </Button>
        </div>
      ))}
    </div>
  );
}
