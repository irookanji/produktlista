import { useSignals } from "@preact/signals-react/runtime";
import { useCallback, useState } from "react";

import { CheckIcon, ShareIcon } from "../icons.tsx";
import { householdToken$ } from "../store/groceryStore.ts";
import { shareFeedback$, shareHousehold } from "../store/householdSync.ts";

export const ShareListButton = () => {
  useSignals();

  const token = householdToken$.value;
  const feedback = shareFeedback$.value;
  const [busy, setBusy] = useState(false);

  const handleClick = useCallback(() => {
    if (busy) {
      return;
    }

    setBusy(true);
    void shareHousehold().finally(() => {
      setBusy(false);
    });
  }, [busy]);

  const copied = feedback === "copied";
  const shared = Boolean(token);

  return (
    <button
      type="button"
      title={shared ? "Copy share link" : "Share list"}
      aria-label={
        copied ? "Link copied" : shared ? "Copy share link" : "Share list"
      }
      disabled={busy}
      className={
        shared
          ? "btn-toolbar bg-brand text-on-brand active:bg-brand-emphasis"
          : "btn-toolbar text-ink active:bg-line"
      }
      onClick={handleClick}
    >
      {copied ? <CheckIcon className="size-icon" /> : <ShareIcon />}
    </button>
  );
};
