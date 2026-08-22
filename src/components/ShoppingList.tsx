import { useSignals } from "@preact/signals-react/runtime";
import { type CSSProperties, type PointerEvent, useRef } from "react";

import { getProductById } from "../data/products.ts";
import {
  type PointerReorderDrag,
  usePointerReorder,
} from "../hooks/usePointerReorder.ts";
import {
  clearCompleted,
  hasBoughtItems$,
  removeShoppingItem,
  reorderShoppingItems,
  shoppingItems$,
  sortedShoppingItems$,
  toggleBought,
} from "../store/groceryStore.ts";
import type { ShoppingItem } from "../types.ts";
import { EmptyShoppingList } from "./EmptyShoppingList.tsx";
import { ProductRow } from "./ProductRow.tsx";
import { ThemeSwitcher } from "./ThemeSwitcher.tsx";

const getReorderStyle = (
  index: number,
  drag: PointerReorderDrag | null,
): CSSProperties => {
  if (!drag) {
    return {};
  }

  if (index === drag.fromIndex) {
    return {
      position: "relative",
      zIndex: 20,
      transform: `translateY(${drag.translateY}px) scale(1.02)`,
      boxShadow: "0 12px 28px rgba(0, 0, 0, 0.12)",
      borderRadius: 12,
      background: "var(--color-surface)",
    };
  }

  let shift = 0;
  if (
    drag.fromIndex < drag.overIndex &&
    index > drag.fromIndex &&
    index <= drag.overIndex
  ) {
    shift = -drag.itemHeight;
  } else if (
    drag.fromIndex > drag.overIndex &&
    index < drag.fromIndex &&
    index >= drag.overIndex
  ) {
    shift = drag.itemHeight;
  }

  return {
    transform: shift === 0 ? undefined : `translateY(${shift}px)`,
    transition: "transform 160ms ease",
  };
};

const getReorderBounds = (
  item: ShoppingItem,
  items: readonly ShoppingItem[],
) => {
  const firstBoughtIndex = items.findIndex((entry) => entry.bought);
  const lastIndex = items.length - 1;

  if (item.bought) {
    return {
      minIndex: firstBoughtIndex === -1 ? lastIndex : firstBoughtIndex,
      maxIndex: lastIndex,
    };
  }

  return {
    minIndex: 0,
    maxIndex:
      firstBoughtIndex === -1 ? lastIndex : Math.max(0, firstBoughtIndex - 1),
  };
};

export const ShoppingList = () => {
  useSignals();

  const skipToggleRef = useRef(false);
  const shoppingItems = shoppingItems$.value;
  const sortedItems = sortedShoppingItems$.value;
  const hasBoughtItems = hasBoughtItems$.value;
  const { listRef, drag, onItemPointerDown } = usePointerReorder({
    onReorder: reorderShoppingItems,
    onDragStart: () => {
      skipToggleRef.current = true;
    },
    onDragEnd: () => {
      window.setTimeout(() => {
        skipToggleRef.current = false;
      }, 0);
    },
  });

  const handleToggle = (productId: string) => {
    if (skipToggleRef.current) {
      skipToggleRef.current = false;
      return;
    }

    toggleBought(productId);
  };

  if (shoppingItems.length === 0) {
    return <EmptyShoppingList />;
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <div
        className={`min-h-0 flex-1 overflow-y-auto ${
          drag ? "overflow-hidden touch-none" : ""
        }`}
      >
        <header className="frosted-header sticky top-0 z-30 px-5 pb-3 pt-[max(1.5rem,env(safe-area-inset-top))]">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-muted uppercase">
              Shopping List
            </p>
            <ThemeSwitcher />
          </div>
          <h1 className="mt-3 text-[34px] leading-none font-bold tracking-tight text-ink">
            Shopping List
          </h1>
          <p className="mt-2 text-[15px] text-muted">
            {shoppingItems.length}{" "}
            {shoppingItems.length === 1 ? "item" : "items"}
          </p>
        </header>

        <ul ref={listRef} className="px-2 select-none">
          {sortedItems.map((item, index) => {
            const product = getProductById(item.productId);
            if (!product) {
              return null;
            }

            const bounds = getReorderBounds(item, sortedItems);

            return (
              <li
                key={item.productId}
                className="touch-callout-none"
                style={getReorderStyle(index, drag)}
                onContextMenu={(event) => event.preventDefault()}
                onPointerDown={(event: PointerEvent<HTMLLIElement>) => {
                  const target = event.target;
                  if (
                    target instanceof Element &&
                    target.closest("[data-no-reorder]")
                  ) {
                    return;
                  }

                  onItemPointerDown(index, event, bounds);
                }}
              >
                <ProductRow
                  product={product}
                  bought={item.bought}
                  onToggle={() => handleToggle(item.productId)}
                  onRemove={() => removeShoppingItem(item.productId)}
                  onReorderPointerDown={(event) => {
                    onItemPointerDown(index, event, bounds, "handle");
                  }}
                />
              </li>
            );
          })}
        </ul>
      </div>

      {hasBoughtItems && (
        <div className="shrink-0 px-4 pt-3 pb-3">
          <button
            type="button"
            className="flex h-14 w-full items-center justify-center rounded-full border-2 border-danger text-[17px] font-semibold text-danger active:bg-red-50 dark:active:bg-red-950/40"
            onClick={clearCompleted}
          >
            Clear Completed
          </button>
        </div>
      )}
    </section>
  );
};
