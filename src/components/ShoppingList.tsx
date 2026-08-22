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
      zIndex: "var(--z-index-drag)",
      transform: `translateY(${drag.translateY}px) scale(var(--scale-drag))`,
      boxShadow: "var(--shadow-drag)",
      borderRadius: "var(--radius-drag)",
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
    transition: "transform var(--duration-reorder) ease",
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
        <header className="frosted-header sticky top-0 z-header px-xl pt-safe-xl pb-md">
          <div className="flex items-center justify-between gap-md">
            <p className="kicker">Shopping List</p>
            <ThemeSwitcher />
          </div>
          <p className="mt-sm text-body text-muted">
            {shoppingItems.length}{" "}
            {shoppingItems.length === 1 ? "item" : "items"}
          </p>
        </header>

        <ul ref={listRef} className="px-sm select-none">
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
        <div className="cta-bar">
          <button type="button" className="btn-danger" onClick={clearCompleted}>
            Clear Completed
          </button>
        </div>
      )}
    </section>
  );
};
