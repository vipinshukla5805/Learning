import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { CookMinutesPipe } from '../pipes/cook-minutes.pipe';
import { RecipeRow } from '../recipe.model';
import { RecipeBoxStore } from '../recipe-box.store';

/** Phase 4 — detail route: params + resolve data. */
@Component({
  selector: 'rb-recipe-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TitleCasePipe, CurrencyPipe, DatePipe, CookMinutesPipe],
  template: `
    <article class="detail">
      <p><a routerLink="..">← Back</a></p>
      @if (recipe(); as r) {
        <h1>{{ r.name | titlecase }}</h1>
        <p>{{ r.summary || 'No summary.' }}</p>
        <p class="meta">
          {{ r.minutes | cookMinutes }} · {{ r.cost | currency }} ·
          {{ r.updatedAt | date: 'mediumDate' }} · course {{ r.course }}
        </p>
        <p class="meta">Param id: <code>{{ id() }}</code> · servings from store: {{ store.servings() }}</p>
      } @else {
        <p>Recipe missing (guard should have redirected).</p>
      }
    </article>
  `,
  styles: `
    .detail {
      max-width: var(--rb-max, 40rem);
    }
    h1 {
      margin: 0.4rem 0;
      font-size: 1.6rem;
    }
    .meta {
      color: var(--rb-muted);
      font-size: 0.92rem;
    }
    a {
      color: var(--rb-accent);
      font-weight: 600;
    }
  `,
})
export class RecipeDetail {
  private readonly route = inject(ActivatedRoute);
  protected readonly store = inject(RecipeBoxStore);

  protected readonly id = toSignal(this.route.paramMap.pipe(map((p) => p.get('id'))), {
    initialValue: null as string | null,
  });

  protected readonly recipe = toSignal(
    this.route.data.pipe(map((d) => (d['recipe'] as RecipeRow | null) ?? null)),
    { initialValue: null as RecipeRow | null },
  );

  protected readonly title = computed(() => this.recipe()?.name ?? 'Recipe');
}
