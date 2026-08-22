import { type ReactNode, useCallback, useId, useState } from "react";

import { usePwaInstall } from "../hooks/usePwaInstall.ts";

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" className="size-icon" fill="none" aria-hidden="true">
    <path
      d="M12 4v10m0 0-3.5-3.5M12 14l3.5-3.5M6 18h12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ShareIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="size-icon text-brand"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M12 15V4m0 0-3.5 3.5M12 4l3.5 3.5M6 11v7a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

type InstallHelpProps = {
  readonly title: string;
  readonly children: ReactNode;
  readonly onClose: () => void;
};

const InstallHelp = ({ title, children, onClose }: InstallHelpProps) => {
  const titleId = useId();

  return (
    <div className="fixed inset-0 z-overlay flex items-end justify-center bg-overlay p-lg pb-safe-lg sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-sheet rounded-sheet bg-surface p-xl shadow-sheet"
      >
        <h2
          id={titleId}
          className="text-title font-bold tracking-tight text-ink"
        >
          {title}
        </h2>
        {children}
        <button
          type="button"
          className="btn-primary btn-compact mt-2xl"
          onClick={onClose}
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export const InstallAppButton = () => {
  const { canInstall, hasNativePrompt, install, isIos } = usePwaInstall();
  const [helpKind, setHelpKind] = useState<"ios" | "android" | null>(null);

  const handleClick = useCallback(async () => {
    if (hasNativePrompt) {
      await install();
      return;
    }

    setHelpKind(isIos ? "ios" : "android");
  }, [hasNativePrompt, install, isIos]);

  if (!canInstall) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        aria-label="Install app"
        className="btn-toolbar bg-brand text-on-brand active:bg-brand-emphasis"
        onClick={() => {
          void handleClick();
        }}
      >
        <DownloadIcon />
      </button>
      {helpKind === "ios" ? (
        <InstallHelp
          title="Add to Home Screen"
          onClose={() => setHelpKind(null)}
        >
          <ol className="mt-lg space-y-md text-body leading-snug text-ink">
            <li className="flex gap-md">
              <span className="mt-2xs shrink-0">
                <ShareIcon />
              </span>
              <span>
                Tap the <strong>Share</strong> button in Safari
              </span>
            </li>
            <li className="flex gap-md">
              <span className="flex size-icon shrink-0 items-center justify-center text-step font-bold text-brand">
                2
              </span>
              <span>
                Tap <strong>View More</strong> (or scroll the list).{" "}
                <strong>Add to Home Screen</strong> is not in the top row
              </span>
            </li>
            <li className="flex gap-md">
              <span className="flex size-icon shrink-0 items-center justify-center text-step font-bold text-brand">
                3
              </span>
              <span>
                Tap <strong>Add</strong> to get the candy icon on your home
                screen
              </span>
            </li>
          </ol>
        </InstallHelp>
      ) : null}
      {helpKind === "android" ? (
        <InstallHelp title="Install app" onClose={() => setHelpKind(null)}>
          <p className="mt-lg text-body leading-snug text-ink">
            Open the browser menu and tap <strong>Install app</strong> or{" "}
            <strong>Add to Home screen</strong>.
          </p>
        </InstallHelp>
      ) : null}
    </>
  );
};
