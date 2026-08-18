"use client";

import "@/styles/app.css";

export default function GlobalError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-full">
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="text-muted-foreground max-w-prose">
            An unexpected error occurred. Please try again.
          </p>
          <button
            type="button"
            className="bg-primary text-primary-foreground hover:bg-primary/80 h-8 rounded-lg px-3 text-sm font-medium"
            onClick={() => reset()}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
