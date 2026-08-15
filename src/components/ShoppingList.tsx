import { useSignals } from "@preact/signals-react/runtime";

import { getProductById } from "../data/products.ts";
import {
  clearCompleted,
  hasBoughtItems$,
  removeShoppingItem,
  shoppingItems$,
  sortedShoppingItems$,
  toggleBought,
} from "../store/groceryStore.ts";
import { EmptyShoppingList } from "./EmptyShoppingList.tsx";
import { ProductRow } from "./ProductRow.tsx";

export const ShoppingList = () => {
  useSignals();

  const shoppingItems = shoppingItems$.value;
  const sortedItems = sortedShoppingItems$.value;
  const hasBoughtItems = hasBoughtItems$.value;

  if (shoppingItems.length === 0) {
    return <EmptyShoppingList />;
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <header className="px-5 pb-3 pt-6">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-muted uppercase">
          Shopping List
        </p>
        <h1 className="mt-3 text-[34px] leading-none font-bold tracking-tight text-ink">
          Shopping List
        </h1>
        <p className="mt-2 text-[15px] text-muted">
          {shoppingItems.length} {shoppingItems.length === 1 ? "item" : "items"}
        </p>
      </header>

      <ul className="min-h-0 flex-1 overflow-y-auto px-2">
        {sortedItems.map((item) => {
          const product = getProductById(item.productId);
          if (!product) {
            return null;
          }

          return (
            <li key={item.productId}>
              <ProductRow
                product={product}
                bought={item.bought}
                onToggle={() => toggleBought(item.productId)}
                onRemove={() => removeShoppingItem(item.productId)}
              />
            </li>
          );
        })}
      </ul>

      {hasBoughtItems && (
        <div className="shrink-0 px-4 pt-3 pb-3">
          <button
            type="button"
            className="flex h-14 w-full items-center justify-center rounded-full border-2 border-danger text-[17px] font-semibold text-danger active:bg-red-50"
            onClick={clearCompleted}
          >
            Clear Completed
          </button>
        </div>
      )}
    </section>
  );
};
