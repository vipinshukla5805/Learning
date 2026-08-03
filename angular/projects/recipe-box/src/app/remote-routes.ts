import { Routes } from '@angular/router';
import { RECIPE_DI_PROVIDERS } from './di/provide-recipe-di';
import { PantrySessionService } from './di/pantry.services';
import { RecipeBoxHome } from './recipe-box-home';
import { RecipeBoxLayout } from './recipe-box-layout';
import { RecipeBoxStore } from './recipe-box.store';
import { canViewRecipe } from './recipe.guard';
import { recipeResolver } from './recipe.resolver';

/**
 * Phase 3–4 — hierarchical providers + child routes (guards, resolve, lazy).
 */
export const RECIPE_BOX_ROUTES: Routes = [
  {
    path: '',
    component: RecipeBoxLayout,
    providers: [RecipeBoxStore, ...RECIPE_DI_PROVIDERS],
    children: [
      {
        path: '',
        component: RecipeBoxHome,
      },
      {
        path: 'recipe/:id',
        loadComponent: () =>
          import('./recipe-detail/recipe-detail').then((m) => m.RecipeDetail),
        canActivate: [canViewRecipe],
        resolve: { recipe: recipeResolver },
        title: 'Recipe detail',
      },
      {
        path: 'pantry',
        loadComponent: () => import('./pantry-page/pantry-page').then((m) => m.PantryPage),
        providers: [PantrySessionService],
        title: 'Pantry',
      },
      {
        path: 'home',
        redirectTo: '',
        pathMatch: 'full',
      },
    ],
  },
];
