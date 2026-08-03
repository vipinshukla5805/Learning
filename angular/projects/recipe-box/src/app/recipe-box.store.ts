import { computed, Injectable, linkedSignal, signal } from '@angular/core';
import { RecipeCourse, RecipeRow, SEED_RECIPES } from './recipe.model';

/**
 * Phase 2 · 2.1–2.2 / 2.5 / 2.7 — Writable + computed + asReadonly + linkedSignal
 * @see https://angular.dev/guide/signals
 *
 * Public API exposes readonly signals; mutations go through methods.
 */
@Injectable()
export class RecipeBoxStore {
  private readonly _recipes = signal<RecipeRow[]>(SEED_RECIPES, {
    // 2.4 — custom equality: skip notify when same ids/order (rare; demo only)
    equal: (a, b) =>
      a.length === b.length && a.every((row, i) => row.id === b[i]?.id && row.name === b[i]?.name),
  });

  private readonly _filterQuery = signal('');
  private readonly _courseFilter = signal<'all' | RecipeCourse>('all');
  private readonly _servings = signal(2);
  private readonly _showDemoCard = signal(true);

  /** 2.1 — consumers can read but not `.set()` / `.update()`. */
  readonly recipes = this._recipes.asReadonly();
  readonly filterQuery = this._filterQuery;
  readonly courseFilter = this._courseFilter;
  readonly servings = this._servings;
  readonly showDemoCard = this._showDemoCard;

  /**
   * 2.7 — writable state that resets when the source (`filterQuery`) changes.
   * User can edit the draft independently until the source changes again.
   */
  readonly filterDraft = linkedSignal(() => this._filterQuery());

  /** 2.2 — dynamic deps: `recipes` only read when demo card is shown in the filter path. */
  readonly visibleRecipes = computed(() => {
    const q = this._filterQuery().trim().toLowerCase();
    const course = this._courseFilter();
    const showDemo = this._showDemoCard();
    return this._recipes().filter((r) => {
      if (!showDemo && r.id === 'salad') {
        return false;
      }
      if (course !== 'all' && r.course !== course) {
        return false;
      }
      if (!q) {
        return true;
      }
      return r.name.toLowerCase().includes(q) || (r.summary?.toLowerCase().includes(q) ?? false);
    });
  });

  readonly avgCost = computed(() => {
    const list = this.visibleRecipes();
    if (!list.length) {
      return 0;
    }
    return list.reduce((sum, r) => sum + r.cost, 0) / list.length;
  });

  readonly fillRate = computed(() => {
    const n = this.visibleRecipes().length;
    return n === 0 ? 0 : n / this._recipes().length;
  });

  readonly recipeCount = computed(() => this._recipes().length);

  setFilter(query: string): void {
    this._filterQuery.set(query);
  }

  clearFilter(): void {
    this._filterQuery.set('');
  }

  setCourse(course: 'all' | RecipeCourse): void {
    this._courseFilter.set(course);
  }

  setServings(n: number): void {
    this._servings.set(n);
  }

  toggleDemoCard(): void {
    this._showDemoCard.update((v) => !v);
  }

  removeByName(name: string): void {
    this._recipes.update((list) => list.filter((r) => r.name !== name));
  }
}
