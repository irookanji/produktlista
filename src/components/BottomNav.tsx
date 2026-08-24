import { useSignals } from "@preact/signals-react/runtime";
import type { ReactNode } from "react";

import { CartIcon, ChecklistIcon } from "../icons.tsx";
import { activeTab$, setActiveTab } from "../store/groceryStore.ts";
import type { TabId } from "../types.ts";

const tabs: { id: TabId; label: string; icon: ReactNode }[] = [
  {
    id: "master",
    label: "Master List",
    icon: <ChecklistIcon />,
  },
  {
    id: "shopping",
    label: "Shopping List",
    icon: <CartIcon />,
  },
];

export const BottomNav = () => {
  useSignals();

  const activeTab = activeTab$.value;

  return (
    <nav
      aria-label="Primary"
      className="grid shrink-0 grid-cols-2 border-t border-line bg-surface pb-safe"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            type="button"
            aria-current={isActive ? "page" : undefined}
            className="flex h-nav flex-col items-center justify-center gap-2xs text-kicker font-medium text-ink"
            onClick={() => setActiveTab(tab.id)}
          >
            <span
              className={`flex size-toolbar items-center justify-center rounded-control ${
                isActive ? "bg-brand-soft text-brand" : "text-ink"
              }`}
            >
              {tab.icon}
            </span>
            <span
              className={isActive ? "font-semibold text-ink" : "text-muted"}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
