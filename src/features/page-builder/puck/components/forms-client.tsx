"use client";

import type { FormEvent, ReactNode } from "react";

const HONEYPOT_FIELD_NAME = "website";

export function HoneypotForm({
  action,
  className,
  children,
}: {
  action?: string;
  className?: string;
  children: ReactNode;
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const honeypot = event.currentTarget.elements.namedItem(
      HONEYPOT_FIELD_NAME,
    ) as HTMLInputElement | null;
    if (honeypot?.value) {
      event.preventDefault();
    }
  }

  return (
    <form
      action={action}
      method="post"
      className={className}
      onSubmit={handleSubmit}
    >
      <input
        type="text"
        name={HONEYPOT_FIELD_NAME}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] size-px opacity-0"
      />
      {children}
    </form>
  );
}
