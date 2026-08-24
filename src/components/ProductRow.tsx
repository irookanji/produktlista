import type { PointerEvent, ReactNode } from "react";

import { CheckIcon, CloseIcon, GripIcon } from "../icons.tsx";
import type { Product } from "../types.ts";

type MasterRowProps = {
  readonly product: Product;
  readonly selected: boolean;
  readonly onToggle: () => void;
  readonly bought?: never;
  readonly onRemove?: never;
  readonly onDelete?: () => void;
  readonly onReorderPointerDown?: never;
};

type ShoppingRowProps = {
  readonly product: Product;
  readonly bought: boolean;
  readonly onToggle: () => void;
  readonly onRemove: () => void;
  readonly selected?: never;
  readonly onDelete?: never;
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
    {checked ? <CheckIcon /> : null}
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
          <CloseIcon />
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
          <CheckIcon />
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
      ) : !isShopping && props.onDelete ? (
        <IconButton
          label={`Remove ${product.name} from master list`}
          onClick={props.onDelete}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </div>
  );
};
