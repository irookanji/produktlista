import { useSignals } from "@preact/signals-react/runtime";

import handlaLogo from "../assets/handla-logo.png";
import { products, productsByCategory } from "../data/products.ts";
import {
  addSelectedToShoppingList,
  selectedCount$,
  selectedIds$,
  toggleSelected,
} from "../store/groceryStore.ts";
import { InstallAppButton } from "./InstallAppButton.tsx";
import { ProductRow } from "./ProductRow.tsx";

export const MasterList = () => {
  useSignals();

  const selectedIds = selectedIds$.value;
  const selectedCount = selectedCount$.value;

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-2">
        <header className="frosted-header sticky top-0 z-30 -mx-2 px-5 pb-2 pt-[max(1rem,env(safe-area-inset-top))]">
          <h1 className="sr-only">Handla</h1>
          <img
            src={handlaLogo}
            alt=""
            className="mx-auto h-auto w-full object-contain"
          />
          <div className="mt-1 flex items-center justify-between gap-3">
            <p className="text-left text-[15px] text-muted">
              {products.length} varor du brukar köpa
            </p>
            <InstallAppButton />
          </div>
        </header>

        {productsByCategory.map((category) => (
          <section
            key={category.id}
            aria-labelledby={`category-${category.id}`}
          >
            <h2
              id={`category-${category.id}`}
              className="px-3 pb-1 pt-4 text-[11px] font-semibold tracking-[0.18em] text-muted uppercase"
            >
              {category.label}
            </h2>
            <ul>
              {category.products.map((product) => {
                const selected = selectedIds.includes(product.id);

                return (
                  <li key={product.id}>
                    <ProductRow
                      product={product}
                      selected={selected}
                      onToggle={() => toggleSelected(product.id)}
                    />
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      {selectedCount > 0 ? (
        <div className="shrink-0 px-4 pt-3 pb-3">
          <button
            type="button"
            className="flex h-14 w-full items-center justify-center rounded-full bg-brand text-[17px] font-semibold text-white shadow-[0_8px_20px_rgba(52,199,89,0.35)] active:bg-brand-dark"
            onClick={addSelectedToShoppingList}
          >
            Add {selectedCount} {selectedCount === 1 ? "Item" : "Items"} to
            Shopping List +
          </button>
        </div>
      ) : null}
    </section>
  );
};
