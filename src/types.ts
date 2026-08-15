export type TabId = "master" | "shopping";

export type ProductCategory =
  | "produce"
  | "fruits"
  | "dairy"
  | "meat"
  | "bakery"
  | "pantry"
  | "frozen"
  | "beverages"
  | "snacks";

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
