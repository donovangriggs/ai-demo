import type { ReactNode } from "react";

/**
 * A title and any follow-up (text, a link, a button) centred in the space
 * available: the layout shared by the not-found and error states.
 */
export function CenteredMessage({
  title,
  children,
  role,
  className = "",
}: {
  title: ReactNode;
  children?: ReactNode;
  role?: "alert";
  /** Extra classes for the wrapper, e.g. to fill the screen outside the sidebar layout. */
  className?: string;
}) {
  return (
    <div
      role={role}
      className={`flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center text-slate-500 ${className}`}
    >
      <p className="text-lg font-semibold text-slate-700">{title}</p>
      {children}
    </div>
  );
}
