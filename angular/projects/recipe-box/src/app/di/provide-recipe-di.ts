import { Provider } from '@angular/core';
import { ConsoleRecipeLogger } from './console-recipe-logger';
import { RecipeLogger } from './tokens';

/** 3.3 — Route-level providers (useClass / useExisting). */
export const RECIPE_DI_PROVIDERS: Provider[] = [
  ConsoleRecipeLogger,
  { provide: RecipeLogger, useExisting: ConsoleRecipeLogger },
];
