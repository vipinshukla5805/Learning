import { inject, Injectable } from '@angular/core';
import { RECIPE_API_BASE, RecipeLogger } from './tokens';

/**
 * 3.1–3.2 — Root service via `providedIn: 'root'` (singleton for this remote).
 */
@Injectable({ providedIn: 'root' })
export class PantryCatalogService {
  private readonly base = inject(RECIPE_API_BASE);
  private readonly log = inject(RecipeLogger, { optional: true });

  listStaples(): string[] {
    this.log?.info(`PantryCatalogService.listStaples @ ${this.base}`);
    return ['olive oil', 'garlic', 'salt', 'eggs'];
  }
}

/**
 * 3.5 / 3.6 — Provided only on a lazy route (not root) → new instance per navigation tree.
 */
@Injectable()
export class PantrySessionService {
  readonly openedAt = new Date().toISOString();
  private visits = 0;

  touch(): number {
    return ++this.visits;
  }
}
