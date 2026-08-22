import { useSignals } from "@preact/signals-react/runtime";
import type { ReactNode } from "react";

import { activeTab$, setActiveTab } from "../store/groceryStore.ts";
import type { TabId } from "../types.ts";

const tabs: { id: TabId; label: string; icon: ReactNode }[] = [
  {
    id: "master",
    label: "Master List",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="5"
          y="5"
          width="14"
          height="14"
          rx="3"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M8.5 12.2 11 14.7 15.5 9.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "shopping",
    label: "Shopping List",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M6 7h2l1.5 9h8l1.8-6H9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="10.5" cy="18.5" r="1.2" fill="currentColor" />
        <circle cx="16.5" cy="18.5" r="1.2" fill="currentColor" />
      </svg>
    ),
  },
];

export const BottomNav = () => {
  useSignals();

  const activeTab = activeTab$.value;

  return (
    <nav
      aria-label="Primary"
      className="grid shrink-0 grid-cols-2 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            type="button"
            aria-current={isActive ? "page" : undefined}
            className="flex h-19 flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-ink"
            onClick={() => setActiveTab(tab.id)}
          >
            <span
              className={`flex size-9 items-center justify-center rounded-lg ${
                isActive ? "bg-tab-active text-brand" : "text-ink"
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
