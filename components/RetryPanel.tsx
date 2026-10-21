"use client";

import { useEffect } from "react";

/**
 * A message and a Retry button for an error boundary. `retry` re-fetches and
 * re-renders the boundary's children (unlike `reset`, which only re-renders).
 */
export function RetryPanel({
  error,
  retry,
  title,
  className = "",
}: {
  error: unknown;
  retry: () => void;
  title: string;
  className?: string;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      role="alert"
      className={`flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center ${className}`}
    >
      <p className="text-lg font-semibold text-slate-700">{title}</p>
      <button
        type="button"
        onClick={() => retry()}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        Retry
      </button>
    </div>
  );
}
