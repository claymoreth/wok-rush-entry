// recipes.js — the 10 ingredients and the 7 recipes of Wok Rush.
export const INGREDIENTS = [
  { id: "rice", key: "1", label: "Rice", icon: "assets/ing-rice.png" },
  { id: "noodles", key: "2", label: "Noodles", icon: "assets/ing-noodles.png" },
  { id: "egg", key: "3", label: "Egg", icon: "assets/ing-egg.png" },
  { id: "chicken", key: "4", label: "Chicken", icon: "assets/ing-chicken.png" },
  { id: "soysauce", key: "5", label: "Soy Sauce", icon: "assets/ing-soysauce.png" },
  { id: "chili", key: "6", label: "Chili", icon: "assets/ing-chili.png" },
  { id: "veggies", key: "7", label: "Veggies", icon: "assets/ing-veggies.png" },
  { id: "bread", key: "8", label: "Bread", icon: "assets/ing-bread.png" },
  { id: "cheese", key: "9", label: "Cheese", icon: "assets/ing-cheese.png" },
  { id: "sauce", key: "0", label: "Sauce", icon: "assets/ing-sauce.png" },
];

export const INGREDIENT_BY_ID = Object.fromEntries(
  INGREDIENTS.map((ing) => [ing.id, ing]),
);

export const INGREDIENT_BY_KEY = Object.fromEntries(
  INGREDIENTS.map((ing) => [ing.key, ing]),
);

export const RECIPES = [
  {
    id: "fried-rice",
    name: "Fried Rice",
    price: 300,
    ingredients: ["rice", "egg", "soysauce", "chili"],
    icon: "assets/dish-fried-rice.png",
  },
  {
    id: "fried-noodles",
    name: "Fried Noodles",
    price: 350,
    ingredients: ["noodles", "chicken", "egg", "veggies"],
    icon: "assets/dish-fried-noodles.png",
  },
  {
    id: "toasted-bread",
    name: "Toasted Bread",
    price: 250,
    ingredients: ["bread", "cheese", "sauce"],
    icon: "assets/dish-toast.png",
  },
  {
    id: "spicy-chicken-rice",
    name: "Spicy Chicken Rice",
    price: 400,
    ingredients: ["rice", "chicken", "chili", "sauce"],
    icon: "assets/dish-spicy-chicken-rice.png",
  },
  {
    id: "chicken-noodles",
    name: "Chicken Noodles",
    price: 350,
    ingredients: ["noodles", "chicken", "chili", "sauce"],
    icon: "assets/dish-fried-noodles.png",
  },
  {
    id: "veggie-fried-rice",
    name: "Veggie Fried Rice",
    price: 300,
    ingredients: ["rice", "veggies", "egg", "sauce"],
    icon: "assets/dish-fried-rice.png",
  },
  {
    id: "spicy-cheese-toast",
    name: "Spicy Cheese Toast",
    price: 280,
    ingredients: ["bread", "cheese", "chili"],
    icon: "assets/dish-toast.png",
  },
];

export const RECIPE_BY_ID = Object.fromEntries(
  RECIPES.map((r) => [r.id, r]),
);

export function sameIngredients(a, b) {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((v, i) => v === sortedB[i]);
}
