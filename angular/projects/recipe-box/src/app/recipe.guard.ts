import { inject } from '@angular/core';
import { CanActivateFn, RedirectCommand, Router } from '@angular/router';
import { RecipeBoxStore } from './recipe-box.store';

/** 4.8 — Functional canActivate. Unknown ids → list. */
export const canViewRecipe: CanActivateFn = (route) => {
  const id = route.paramMap.get('id');
  const store = inject(RecipeBoxStore);
  const router = inject(Router);
  const ok = !!id && store.recipes().some((r) => r.id === id);
  if (ok) {
    return true;
  }
  // Parent of `recipe/:id` is the layout `''` → go to recipes list
  return new RedirectCommand(router.createUrlTree(['']));
};
