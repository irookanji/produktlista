export type TabId = "master" | "shopping";

export type ThemePreference = "light" | "dark" | "system";

export type ProductCategory =
  | "produce"
  | "fruits"
  | "dairy"
  | "meat"
  | "bakery"
  | "pantry"
  | "frozen"
  | "beverages"
  | "snacks"
  | "household";

export type ProductCategoryMeta = {
  readonly id: ProductCategory;
  readonly label: string;
};

export type Product = {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly category: ProductCategory;
  readonly custom?: true;
};

export type ShoppingItem = {
  readonly productId: string;
  readonly bought: boolean;
};
