import { useEffect, useId, useRef, useState } from "react";

import { isProductCategory, productCategories } from "../data/products.ts";
import {
  addCustomProduct,
  DEFAULT_CUSTOM_ICON,
} from "../store/groceryStore.ts";
import type { ProductCategory } from "../types.ts";

type AddProductSheetProps = {
  readonly onClose: () => void;
};

const DEFAULT_CATEGORY: ProductCategory = "produce";

export const AddProductSheet = ({ onClose }: AddProductSheetProps) => {
  const titleId = useId();
  const nameId = useId();
  const iconId = useId();
  const categoryId = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [category, setCategory] = useState<ProductCategory>(DEFAULT_CATEGORY);

  const canSave = name.trim().length > 0;

  useEffect(() => {
    nameRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-overlay flex items-end justify-center bg-overlay p-lg pb-safe-lg sm:items-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-sheet rounded-sheet bg-surface p-xl shadow-sheet"
      >
        <h2
          id={titleId}
          className="text-title font-bold tracking-tight text-ink"
        >
          Add item
        </h2>
        <form
          className="mt-lg flex flex-col gap-lg"
          onSubmit={(event) => {
            event.preventDefault();
            const product = addCustomProduct({ name, icon, category });
            if (product) {
              onClose();
            }
          }}
        >
          <div className="flex flex-col gap-xs">
            <label htmlFor={nameId} className="text-step font-medium text-ink">
              Name
            </label>
            <input
              id={nameId}
              ref={nameRef}
              type="text"
              autoComplete="off"
              autoCapitalize="sentences"
              enterKeyHint="next"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-button-sm rounded-control border border-line-strong bg-surface px-md text-item text-ink"
            />
          </div>
          <div className="flex flex-col gap-xs">
            <label htmlFor={iconId} className="text-step font-medium text-ink">
              Emoji
            </label>
            <input
              id={iconId}
              type="text"
              inputMode="text"
              autoComplete="off"
              enterKeyHint="next"
              placeholder={DEFAULT_CUSTOM_ICON}
              value={icon}
              onChange={(event) => setIcon(event.target.value)}
              className="h-button-sm rounded-control border border-line-strong bg-surface px-md text-item text-ink"
            />
          </div>
          <div className="flex flex-col gap-xs">
            <label
              htmlFor={categoryId}
              className="text-step font-medium text-ink"
            >
              Category
            </label>
            <select
              id={categoryId}
              value={category}
              onChange={(event) => {
                if (isProductCategory(event.target.value)) {
                  setCategory(event.target.value);
                }
              }}
              className="h-button-sm rounded-control border border-line-strong bg-surface px-md text-item text-ink"
            >
              {productCategories.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-sm flex flex-col gap-md">
            <button
              type="submit"
              className="btn-primary btn-compact disabled:opacity-bought"
              disabled={!canSave}
            >
              Save
            </button>
            <button
              type="button"
              className="h-button-sm w-full text-body font-medium text-muted"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
