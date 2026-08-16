export type TabId = "master" | "shopping";

type ProductCategory =
  | "produce"
  | "fruits"
  | "dairy"
  | "meat"
  | "bakery"
  | "pantry"
  | "frozen"
  | "beverages"
  | "snacks";

export type ProductCategoryMeta = {
  readonly id: ProductCategory;
  readonly label: string;
};

export type Product = {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly category: ProductCategory;
};

export type ShoppingItem = {
  readonly productId: string;
  readonly bought: boolean;
};
