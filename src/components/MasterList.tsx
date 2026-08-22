import { useSignals } from "@preact/signals-react/runtime";

import { products, productsByCategory } from "../data/products.ts";
import {
  addSelectedToShoppingList,
  selectedCount$,
  selectedIds$,
  toggleSelected,
} from "../store/groceryStore.ts";
import { InstallAppButton } from "./InstallAppButton.tsx";
import { ProductRow } from "./ProductRow.tsx";
import { ThemeSwitcher } from "./ThemeSwitcher.tsx";

export const MasterList = () => {
  useSignals();

  const selectedIds = selectedIds$.value;
  const selectedCount = selectedCount$.value;

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-sm">
        <header className="frosted-header sticky top-0 z-header -mx-sm px-xl pt-safe pb-sm">
          <h1 className="sr-only">Handla</h1>
          <div className="flex items-center justify-between gap-md">
            <p className="text-left text-body text-muted">
              {products.length} varor du brukar köpa
            </p>
            <div className="flex shrink-0 items-center gap-sm">
              <ThemeSwitcher />
              <InstallAppButton />
            </div>
          </div>
        </header>

        {productsByCategory.map((category) => (
          <section
            key={category.id}
            aria-labelledby={`category-${category.id}`}
          >
            <h2
              id={`category-${category.id}`}
              className="kicker px-md pt-lg pb-xs"
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
        <div className="cta-bar">
          <button
            type="button"
            className="btn-primary btn-primary-shadow"
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
