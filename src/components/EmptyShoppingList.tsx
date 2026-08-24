import { EmptyCartIcon } from "../icons.tsx";
import { setActiveTab } from "../store/groceryStore.ts";
import { ThemeSwitcher } from "./ThemeSwitcher.tsx";

export const EmptyShoppingList = () => (
  <section className="flex min-h-0 flex-1 flex-col px-3xl pt-safe-xl">
    <header>
      <div className="flex items-center justify-between gap-md">
        <p className="kicker">Shopping List</p>
        <ThemeSwitcher />
      </div>
      <h1 className="mt-md text-display font-bold tracking-tight text-ink">
        Shopping List
      </h1>
    </header>

    <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
      <div className="flex size-empty-ring items-center justify-center rounded-pill bg-brand-soft">
        <EmptyCartIcon className="size-empty-icon text-ink" />
      </div>

      <h2 className="mt-3xl text-heading font-bold tracking-tight text-ink">
        List is Empty
      </h2>
      <p className="mt-sm max-w-empty-copy text-center text-body leading-snug text-muted">
        Inga varor ännu! Lägg till från listan.
      </p>

      <button
        type="button"
        className="btn-primary mt-3xl max-w-empty-action"
        onClick={() => setActiveTab("master")}
      >
        Till listan
      </button>
    </div>
  </section>
);
