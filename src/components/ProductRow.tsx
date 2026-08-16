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
    className={`flex size-7 shrink-0 items-center justify-center rounded-[7px] border-2 ${
      checked ? "border-brand bg-brand text-white" : "border-[#c8c8cc] bg-white"
    }`}
  >
    {checked ? (
      <svg
        viewBox="0 0 16 16"
        className="size-4"
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
    className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#9a9aa0] text-white"
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
    className="size-4"
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
      className={`flex min-h-16 items-center gap-3 border-b border-line px-3 ${
        bought ? "text-completed" : "text-ink"
      }`}
    >
      {bought && isShopping ? (
        <IconButton label={`Remove ${product.name}`} onClick={props.onRemove}>
          <svg
            viewBox="0 0 16 16"
            className="size-4"
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
          className="flex min-h-11 min-w-11 items-center justify-center"
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
        className="flex min-h-11 min-w-0 flex-1 items-center gap-3 py-3 text-left"
        onClick={onToggle}
      >
        <span
          className={`relative text-[22px] leading-none ${bought ? "opacity-40" : ""}`}
        >
          {product.icon}
          {bought ? (
            <span className="absolute top-1/2 -right-1.5 -left-1.5 h-0.5 bg-completed" />
          ) : null}
        </span>
        <span
          className={`truncate text-[16px] leading-snug ${
            bought ? "line-through" : "font-medium"
          }`}
        >
          {product.name}
        </span>
      </button>

      {bought ? (
        <span
          aria-hidden="true"
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#9a9aa0] text-white"
        >
          <svg
            viewBox="0 0 16 16"
            className="size-4"
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
        </span>
      ) : onReorderPointerDown ? (
        <button
          type="button"
          aria-label={`Reorder ${product.name}`}
          className="flex size-8 shrink-0 touch-none items-center justify-center text-muted"
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
