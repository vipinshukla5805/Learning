import { InjectionToken } from '@angular/core';

/** 3.3 / 3.8 — InjectionToken (prefer over string tokens). */
export const RECIPE_API_BASE = new InjectionToken<string>('RECIPE_API_BASE', {
  providedIn: 'root',
  factory: () => '/api/recipes',
});

/** 3.8 — Lightweight token: interface only; implementers provided separately. */
export abstract class RecipeLogger {
  abstract info(message: string): void;
  abstract warn(message: string): void;
}
