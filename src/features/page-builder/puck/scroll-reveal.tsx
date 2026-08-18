"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const animationClassMap: Record<string, { hidden: string; visible: string }> = {
  fade: { hidden: "opacity-0", visible: "opacity-100" },
  "slide-up": {
    hidden: "opacity-0 translate-y-6",
    visible: "opacity-100 translate-y-0",
  },
  zoom: {
    hidden: "opacity-0 scale-95",
    visible: "opacity-100 scale-100",
  },
};

export function ScrollReveal({
  animation,
  isEditing,
  children,
}: {
  animation: string;
  isEditing?: boolean;
  children: ReactNode;
}) {
  return (
    <ScrollRevealInstance
      key={`${animation}-${isEditing ? "edit" : "live"}`}
      animation={animation}
      isEditing={isEditing}
    >
      {children}
    </ScrollRevealInstance>
  );
}

function ScrollRevealInstance({
  animation,
  isEditing,
  children,
}: {
  animation: string;
  isEditing?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isEditing) return;
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [isEditing]);

  useEffect(() => {
    if (isEditing) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isEditing]);

  const config = animationClassMap[animation] ?? animationClassMap.fade;

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? config.visible : config.hidden}`}
    >
      {children}
    </div>
  );
}
