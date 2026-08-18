"use client";

import { useState, type ReactNode } from "react";

export function TabsClient({
  tabs,
}: {
  tabs: { label: string; content: ReactNode }[];
}) {
  const [active, setActive] = useState(0);
  const activeIndex = Math.min(active, Math.max(tabs.length - 1, 0));

  return (
    <div>
      <div
        role="tablist"
        className="border-border flex flex-wrap gap-1 border-b"
      >
        {tabs.map((tab, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === activeIndex}
            onClick={() => setActive(i)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              i === activeIndex
                ? "border-primary text-primary"
                : "text-muted-foreground border-transparent hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="py-5">
        {tabs[activeIndex]?.content}
      </div>
    </div>
  );
}
