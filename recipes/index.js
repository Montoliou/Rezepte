import { teriyakiBowl } from "./teriyaki-bowl.js";

export const recipes = [teriyakiBowl];

export function getRecipe(recipeId) {
  return recipes.find((recipe) => recipe.id === recipeId) ?? recipes[0];
}
