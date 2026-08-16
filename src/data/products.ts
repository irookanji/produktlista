import type { Product, ProductCategoryMeta } from "../types.ts";

const PRODUCT_CATEGORIES = [
  { id: "produce", label: "Produce" },
  { id: "fruits", label: "Fruits" },
  { id: "dairy", label: "Dairy & Eggs" },
  { id: "meat", label: "Meat & Seafood" },
  { id: "bakery", label: "Bakery" },
  { id: "pantry", label: "Pantry" },
  { id: "frozen", label: "Frozen" },
  { id: "beverages", label: "Beverages" },
  { id: "snacks", label: "Snacks" },
] satisfies ReadonlyArray<ProductCategoryMeta>;

export const products = [
  {
    id: "salad",
    name: "Salad (Mixed Greens) - Fresh",
    icon: "🥗",
    category: "produce",
  },
  {
    id: "cucumbers",
    name: "Cucumbers - Fresh",
    icon: "🥒",
    category: "produce",
  },
  {
    id: "tomatoes",
    name: "Tomatoes (Roma) - Ripe",
    icon: "🍅",
    category: "produce",
  },
  {
    id: "mushrooms",
    name: "Mushrooms (White) - Fresh",
    icon: "🍄",
    category: "produce",
  },
  {
    id: "spinach",
    name: "Spinach (Bag) - Organic",
    icon: "🥬",
    category: "produce",
  },
  {
    id: "avocados",
    name: "Avocados (Hass) - Ripe",
    icon: "🥑",
    category: "produce",
  },
  {
    id: "carrots",
    name: "Carrots (Bunch) - Fresh",
    icon: "🥕",
    category: "produce",
  },
  { id: "broccoli", name: "Broccoli - Crown", icon: "🥦", category: "produce" },
  {
    id: "potatoes",
    name: "Potatoes (Russet) - 5 lb",
    icon: "🥔",
    category: "produce",
  },
  {
    id: "onions",
    name: "Onions (Yellow) - Bag",
    icon: "🧅",
    category: "produce",
  },
  {
    id: "garlic",
    name: "Garlic (Bulb) - Fresh",
    icon: "🧄",
    category: "produce",
  },

  { id: "fruits", name: "Fruits - Mixed", icon: "🍇", category: "fruits" },
  {
    id: "bananas",
    name: "Bananas (Bunch) - Ripe",
    icon: "🍌",
    category: "fruits",
  },
  {
    id: "apples",
    name: "Apples (Honeycrisp) - Fresh",
    icon: "🍎",
    category: "fruits",
  },
  {
    id: "strawberries",
    name: "Strawberries - Fresh",
    icon: "🍓",
    category: "fruits",
  },
  {
    id: "oranges",
    name: "Oranges (Navel) - Bag",
    icon: "🍊",
    category: "fruits",
  },

  {
    id: "milk",
    name: "Milk (1 Litre) - Organic",
    icon: "🥛",
    category: "dairy",
  },
  { id: "eggs", name: "Eggs (6) - Free Range", icon: "🥚", category: "dairy" },
  {
    id: "cheese",
    name: "Cheese (Cheddar) - Block",
    icon: "🧀",
    category: "dairy",
  },
  {
    id: "yogurt",
    name: "Yogurt (Greek) - Plain",
    icon: "🥣",
    category: "dairy",
  },
  {
    id: "butter",
    name: "Butter (Unsalted) - Stick",
    icon: "🧈",
    category: "dairy",
  },

  {
    id: "chicken",
    name: "Chicken Breast - Boneless",
    icon: "🍗",
    category: "meat",
  },
  {
    id: "beef",
    name: "Ground Beef (1 lb) - Lean",
    icon: "🥩",
    category: "meat",
  },
  { id: "salmon", name: "Salmon Fillet - Fresh", icon: "🐟", category: "meat" },

  {
    id: "bread",
    name: "Bread (Whole Wheat) - Fresh",
    icon: "🍞",
    category: "bakery",
  },

  {
    id: "pasta",
    name: "Pasta (Penne / Fusilli) - Box",
    icon: "🍝",
    category: "pantry",
  },
  {
    id: "pasta-sauce",
    name: "Pasta Sauce (Tomato) - Jar",
    icon: "🥫",
    category: "pantry",
  },
  { id: "pesto", name: "Pesto (Basil) - Jar", icon: "🌿", category: "pantry" },
  {
    id: "soy-sauce",
    name: "Soy Sauce - Bottle",
    icon: "🍶",
    category: "pantry",
  },
  { id: "rice", name: "Rice (Jasmine) - 2 lb", icon: "🍚", category: "pantry" },
  {
    id: "olive-oil",
    name: "Olive Oil - Extra Virgin",
    icon: "🫒",
    category: "pantry",
  },
  {
    id: "cereal",
    name: "Cereal (Oats) - Whole Grain",
    icon: "🌾",
    category: "pantry",
  },

  {
    id: "frozen-meatballs",
    name: "Frozen Meatballs",
    icon: "🧆",
    category: "frozen",
  },
  {
    id: "frozen-vegetables",
    name: "Frozen Vegetables - Mixed",
    icon: "🧊",
    category: "frozen",
  },

  {
    id: "orange-juice",
    name: "Orange Juice - Pulp Free",
    icon: "🧃",
    category: "beverages",
  },
  { id: "black-tea", name: "Black Tea", icon: "🫖", category: "beverages" },
  { id: "green-tea", name: "Green Tea", icon: "🍵", category: "beverages" },
  { id: "beer", name: "Beer", icon: "🍺", category: "beverages" },

  { id: "goodies", name: "Goodies (Sweets)", icon: "🍪", category: "snacks" },
  { id: "chips", name: "Chips", icon: "🍟", category: "snacks" },
] satisfies ReadonlyArray<Product>;

export const productsByCategory = PRODUCT_CATEGORIES.map((category) => ({
  ...category,
  products: products.filter((product) => product.category === category.id),
}));

export const getProductById = (productId: string): Product | undefined =>
  products.find((product) => product.id === productId);
