import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { RecipeBoxStore } from './recipe-box.store';
import { RecipeRow } from './recipe.model';

/** 4.9 — Functional resolver. */
export const recipeResolver: ResolveFn<RecipeRow | null> = (route) => {
  const id = route.paramMap.get('id');
  return inject(RecipeBoxStore).recipes().find((r) => r.id === id) ?? null;
};
