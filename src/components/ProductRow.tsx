import type { PointerEvent, ReactNode } from "react";

import type { Product } from "../types.ts";

type MasterRowProps = {
  readonly product: Product;
  readonly selected: boolean;
  readonly onToggle: () => void;
  readonly bought?: never;
  readonly onRemove?: never;
  readonly onReorderPointerDown?: never;
};

type ShoppingRowProps = {
  readonly product: Product;
  readonly bought: boolean;
  readonly onToggle: () => void;
  readonly onRemove: () => void;
  readonly selected?: never;
  readonly onReorderPointerDown?: (
    event: PointerEvent<HTMLButtonElement>,
  ) => void;
};

type ProductRowProps = MasterRowProps | ShoppingRowProps;

const Checkbox = ({ checked }: { checked: boolean }) => (
  <span
    aria-hidden="true"
    className={`flex size-checkbox shrink-0 items-center justify-center rounded-checkbox border-control ${
      checked
        ? "border-brand bg-brand text-on-brand"
        : "border-line-strong bg-surface"
    }`}
  >
    {checked ? (
      <svg
        viewBox="0 0 16 16"
        className="size-icon-sm"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M3.5 8.2 6.4 11.2 12.5 4.8"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ) : null}
  </span>
);

const IconButton = ({
  label,
  children,
  onClick,
}: {
  label: string;
  children: ReactNode;
  onClick: () => void;
}) => (
  <button
    type="button"
    aria-label={label}
    data-no-reorder=""
    className="flex size-icon-button shrink-0 items-center justify-center rounded-pill bg-icon-well text-on-brand"
    onClick={(event) => {
      event.stopPropagation();
      onClick();
    }}
  >
    {children}
  </button>
);

const GripIcon = () => (
  <svg
    viewBox="0 0 16 16"
    className="size-icon-sm"
    fill="currentColor"
    aria-hidden="true"
  >
    <circle cx="6" cy="3.5" r="1.15" />
    <circle cx="10" cy="3.5" r="1.15" />
    <circle cx="6" cy="8" r="1.15" />
    <circle cx="10" cy="8" r="1.15" />
    <circle cx="6" cy="12.5" r="1.15" />
    <circle cx="10" cy="12.5" r="1.15" />
  </svg>
);

export const ProductRow = (props: ProductRowProps) => {
  const { product, onToggle } = props;
  const isShopping = "bought" in props && typeof props.bought === "boolean";
  const bought = isShopping ? props.bought : false;
  const selected = !isShopping && props.selected;
  const onReorderPointerDown = isShopping
    ? props.onReorderPointerDown
    : undefined;

  return (
    <div
      className={`flex min-h-row items-center gap-md border-b border-line px-md ${
        bought ? "text-completed" : "text-ink"
      }`}
    >
      {bought && isShopping ? (
        <IconButton label={`Remove ${product.name}`} onClick={props.onRemove}>
          <svg
            viewBox="0 0 16 16"
            className="size-icon-sm"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 4l8 8M12 4l-8 8"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </IconButton>
      ) : (
        <button
          type="button"
          data-no-reorder=""
          className="flex min-h-hit min-w-hit items-center justify-center"
          aria-pressed={isShopping ? bought : selected}
          aria-label={
            isShopping
              ? `Mark ${product.name} as bought`
              : `Select ${product.name}`
          }
          onClick={onToggle}
        >
          <Checkbox checked={Boolean(selected)} />
        </button>
      )}

      <button
        type="button"
        className="flex min-h-hit min-w-0 flex-1 items-center gap-md py-md text-left"
        onClick={onToggle}
      >
        <span
          className={`relative text-emoji leading-none ${bought ? "opacity-bought" : ""}`}
        >
          {product.icon}
          {bought ? (
            <span className="absolute top-1/2 -right-sm -left-sm h-2xs bg-completed" />
          ) : null}
        </span>
        <span
          className={`truncate text-item leading-snug ${
            bought ? "line-through" : "font-medium"
          }`}
        >
          {product.name}
        </span>
      </button>

      {bought && isShopping ? (
        <IconButton
          label={`Mark ${product.name} as not bought`}
          onClick={onToggle}
        >
          <svg
            viewBox="0 0 16 16"
            className="size-icon-sm"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3.5 8.2 6.4 11.2 12.5 4.8"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </IconButton>
      ) : onReorderPointerDown ? (
        <button
          type="button"
          aria-label={`Reorder ${product.name}`}
          className="flex size-icon-button shrink-0 touch-none items-center justify-center text-muted"
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => {
            event.stopPropagation();
            onReorderPointerDown(event);
          }}
        >
          <GripIcon />
        </button>
      ) : null}
    </div>
  );
};
