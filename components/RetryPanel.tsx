"use client";

import { useEffect } from "react";
import { CenteredMessage } from "./CenteredMessage";

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
    <CenteredMessage role="alert" title={title} className={className}>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        Retry
      </button>
    </CenteredMessage>
  );
}
