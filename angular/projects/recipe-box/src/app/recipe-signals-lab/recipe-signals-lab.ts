import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  debounced,
  effect,
  inject,
  isSignal,
  isWritableSignal,
  resource,
  signal,
  untracked,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { of, delay, map } from 'rxjs';
import { RecipeBoxStore } from '../recipe-box.store';
import { RecipeCourse } from '../recipe.model';

const COURSE_TIPS: Record<RecipeCourse | 'all', string> = {
  all: 'Browse everything — then narrow by course.',
  mains: 'Mains: salt pasta water like the sea.',
  breakfast: 'Breakfast: soft eggs finish off-heat.',
  sides: 'Sides: acid + fat wakes up greens.',
};

/**
 * Phase 2 — Signals lab (effect, resource, debounced, rxjs-interop)
 * Separated so home stays readable; OnPush + signal reads drive CD.
 */
@Component({
  selector: 'rb-signals-lab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="lab">
      <p class="lab__title">Signals lab (Phase 2)</p>

      <div class="lab__row">
        <button type="button" class="chip" (click)="showDetail.set(!showDetail())">
          {{ showDetail() ? 'Hide' : 'Show' }} detail (dynamic computed deps)
        </button>
        <button type="button" class="chip" (click)="bumpNoise()">
          Bump noise (untracked in effect)
        </button>
        <button type="button" class="chip" (click)="tipsResource.reload()">
          Reload tips resource
        </button>
      </div>

      <p class="lab__line">
        {{ summary() }}
      </p>

      <p class="lab__line">
        Debounced filter:
        <code>{{ debouncedFilter.value() || '(empty)' }}</code>
        · status <code>{{ debouncedFilter.status() }}</code>
      </p>

      <p class="lab__line">
        Tips resource:
        @if (tipsResource.isLoading()) {
          <em>loading…</em>
        } @else if (tipsResource.hasValue()) {
          {{ tipsResource.value() }}
        } @else {
          <em>idle / error</em>
        }
        · status <code>{{ tipsResource.status() }}</code>
      </p>

      <p class="lab__line">
        toSignal(pantryTip$): {{ pantryTip() || '…' }}
      </p>

      <p class="lab__meta">
        isSignal(filterQuery)={{ isFilterSignal }} ·
        isWritableSignal(filterQuery)={{ isFilterWritable }} ·
        effect log: {{ effectLog() }} ·
        afterRenderEffect: {{ renderNote() }}
      </p>
    </section>
  `,
  styles: `
    .lab {
      padding: 0.85rem 1rem;
      border: 1px solid color-mix(in srgb, var(--rb-accent) 22%, transparent);
      border-radius: calc(var(--rb-radius) + 0.1rem);
      background: color-mix(in srgb, var(--rb-surface) 40%, #e8f0f4);
    }
    .lab__title {
      margin: 0 0 0.45rem;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--rb-muted);
    }
    .lab__row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      margin-bottom: 0.55rem;
    }
    .chip {
      border: 1px solid color-mix(in srgb, var(--rb-accent) 30%, transparent);
      background: #fff;
      border-radius: var(--rb-radius);
      padding: 0.3rem 0.55rem;
      font: inherit;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
    }
    .lab__line {
      margin: 0 0 0.35rem;
      font-size: 0.9rem;
    }
    .lab__meta {
      margin: 0.4rem 0 0;
      font-size: 0.78rem;
      color: var(--rb-muted);
    }
    code {
      font-size: 0.84em;
      color: var(--rb-ink);
    }
  `,
})
export class RecipeSignalsLab {
  private readonly store = inject(RecipeBoxStore);

  /** 2.2 — when false, `visibleRecipes` is not read → not a dependency. */
  protected readonly showDetail = signal(true);
  protected readonly noise = signal(0);
  protected readonly effectLog = signal('(waiting)');
  protected readonly renderNote = signal('—');

  protected readonly isFilterSignal = isSignal(this.store.filterQuery);
  protected readonly isFilterWritable = isWritableSignal(this.store.filterQuery);

  /**
   * 2.2 — dynamic dependencies: only tracks `visibleRecipes` when showDetail is true.
   */
  protected readonly summary = computed(() => {
    if (!this.showDetail()) {
      return 'Detail hidden — visibleRecipes() not read (dynamic deps).';
    }
    const n = this.store.visibleRecipes().length;
    return `Detail: ${n} visible of ${this.store.recipeCount()} · avg $${this.store.avgCost().toFixed(2)}`;
  });

  /** 2.9 — experimental debounced filter for search. */
  protected readonly debouncedFilter = debounced(this.store.filterQuery, 300);

  /**
   * 2.8 — resource loader; params from course (+ debounced query for demo chaining feel).
   */
  protected readonly tipsResource = resource({
    params: () => ({
      course: this.store.courseFilter(),
      q: this.debouncedFilter.value() ?? '',
    }),
    loader: async ({ params, abortSignal }) => {
      await delayMs(350, abortSignal);
      const tip = COURSE_TIPS[params.course];
      return params.q ? `${tip} (q: “${params.q}”)` : tip;
    },
  });

  /** 2.6 — Observable → signal. */
  protected readonly pantryTip = toSignal(
    of('Toast spices briefly — blooms aroma without burning.').pipe(delay(500)),
    { initialValue: '' },
  );

  /** 2.6 — signal → Observable (available for subscribers / AsyncPipe elsewhere). */
  protected readonly filterQuery$ = toObservable(this.store.filterQuery).pipe(
    map((q) => q.trim()),
  );

  constructor() {
    // 2.3 / 2.10 — effect: track course; untracked noise so bumps don't re-run
    effect(() => {
      const course = this.store.courseFilter();
      const noise = untracked(() => this.noise());
      this.effectLog.set(`course→${course} (noise=${noise}, untracked)`);
    });

    // 2.10 — runs after render when signal deps change
    afterRenderEffect(() => {
      const n = this.store.visibleRecipes().length;
      const next = `${n} card(s) after render`;
      // Avoid render loops: only write when the note actually changes.
      untracked(() => {
        if (this.renderNote() !== next) {
          this.renderNote.set(next);
        }
      });
    });
  }

  protected bumpNoise(): void {
    this.noise.update((n) => n + 1);
  }
}

function delayMs(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    const id = setTimeout(() => resolve(), ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(id);
      reject(signal.reason);
    });
  });
}
