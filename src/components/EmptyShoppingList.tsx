import { setActiveTab } from "../store/groceryStore.ts";
import { ThemeSwitcher } from "./ThemeSwitcher.tsx";

export const EmptyShoppingList = () => (
  <section className="flex min-h-0 flex-1 flex-col px-8 pt-[max(1.5rem,env(safe-area-inset-top))]">
    <header>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-muted uppercase">
          Shopping List
        </p>
        <ThemeSwitcher />
      </div>
      <h1 className="mt-3 text-[34px] leading-none font-bold tracking-tight text-ink">
        Shopping List
      </h1>
    </header>

    <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
      <div className="flex size-40 items-center justify-center rounded-full bg-empty-ring">
        <svg
          aria-hidden="true"
          viewBox="0 0 88 88"
          className="size-20 text-ink"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="32" cy="72" r="5" fill="currentColor" stroke="none" />
          <circle cx="64" cy="72" r="5" fill="currentColor" stroke="none" />
          <path d="M16 24h8l8 36h32l8-24H30" />
          <path d="M28 24c2-8 8-14 16-14" />
        </svg>
      </div>

      <h2 className="mt-8 text-[28px] font-bold tracking-tight text-ink">
        List is Empty
      </h2>
      <p className="mt-2 max-w-[16rem] text-center text-[15px] leading-snug text-muted">
        Inga varor ännu! Lägg till från listan.
      </p>

      <button
        type="button"
        className="mt-8 flex h-14 w-full max-w-xs items-center justify-center rounded-full bg-brand text-[17px] font-semibold text-white active:bg-brand-dark"
        onClick={() => setActiveTab("master")}
      >
        Till listan
      </button>
    </div>
  </section>
);
