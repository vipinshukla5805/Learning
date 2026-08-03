import {
  AsyncPipe,
  CurrencyPipe,
  DatePipe,
  DecimalPipe,
  JsonPipe,
  NgComponentOutlet,
  NgTemplateOutlet,
  PercentPipe,
  TitleCasePipe,
  UpperCasePipe,
} from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  inputBinding,
  outputBinding,
  signal,
  Type,
  viewChild,
  viewChildren,
  ViewContainerRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { of, delay } from 'rxjs';
import { RecipeActionButton } from './recipe-action-button/recipe-action-button';
import { RecipeBoxHeader } from './recipe-box-header/recipe-box-header';
import { RecipeBoxStore } from './recipe-box.store';
import { RecipeCard } from './recipe-card/recipe-card';
import { RecipeDiLab } from './recipe-di-lab/recipe-di-lab';
import { RecipeEmptyState } from './recipe-empty-state/recipe-empty-state';
import { RecipePanel } from './recipe-panel/recipe-panel';
import { CookMinutesPipe } from './pipes/cook-minutes.pipe';
import { KebabCasePipe } from './pipes/kebab-case.pipe';
import { RbHighlightDirective } from './directives/rb-highlight.directive';
import { RbUnlessDirective } from './directives/rb-unless.directive';
import { RecipeSecondaryActionButton } from './recipe-secondary-action-button/recipe-secondary-action-button';
import { RecipeServingsStepper } from './recipe-servings-stepper/recipe-servings-stepper';
import { RecipeSignalsLab } from './recipe-signals-lab/recipe-signals-lab';
import { RecipeTipBanner } from './recipe-tip-banner/recipe-tip-banner';
import { RecipeWhitespaceDemo } from './recipe-whitespace-demo/recipe-whitespace-demo';

/**
 * Phase 2–4 labs live here; store / DI come from parent route providers.
 */
@Component({
  selector: 'rb-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:keydown.escape)': 'onWindowEscape()',
  },
  imports: [
    FormsModule,
    RouterLink,
    AsyncPipe,
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
    JsonPipe,
    PercentPipe,
    TitleCasePipe,
    UpperCasePipe,
    NgComponentOutlet,
    NgTemplateOutlet,
    CookMinutesPipe,
    KebabCasePipe,
    RbHighlightDirective,
    RbUnlessDirective,
    RecipeBoxHeader,
    RecipeEmptyState,
    RecipeCard,
    RecipeActionButton,
    RecipeSecondaryActionButton,
    RecipePanel,
    RecipeServingsStepper,
    RecipeTipBanner,
    RecipeWhitespaceDemo,
    RecipeSignalsLab,
    RecipeDiLab,
  ],
  templateUrl: './recipe-box-home.html',
  styleUrl: './recipe-box-home.scss',
})
export class RecipeBoxHome {
  private readonly destroyRef = inject(DestroyRef);
  protected readonly store = inject(RecipeBoxStore);

  protected readonly status = signal('');
  protected readonly adding = signal(false);
  protected readonly showTip = signal(true);
  protected readonly hideDirectiveDemo = signal(false);

  protected readonly theme = signal<'warm' | 'cool'>('warm');
  protected readonly dense = signal(false);

  /** Aliases so the template stays short. */
  protected readonly filterQuery = this.store.filterQuery;
  protected readonly filterDraft = this.store.filterDraft;
  protected readonly servings = this.store.servings;
  protected readonly courseFilter = this.store.courseFilter;
  protected readonly showDemoCard = this.store.showDemoCard;
  protected readonly visibleRecipes = this.store.visibleRecipes;
  protected readonly avgCost = this.store.avgCost;
  protected readonly fillRate = this.store.fillRate;

  protected readonly pantryTip$ = of('Toast spices briefly — blooms aroma without burning.').pipe(
    delay(600),
  );

  protected readonly accent = computed(() =>
    this.theme() === 'warm' ? '#c45c26' : '#2c5f7a',
  );
  protected readonly labClasses = computed(() => ({
    'bind-lab--warm': this.theme() === 'warm',
    'bind-lab--cool': this.theme() === 'cool',
  }));
  protected readonly labAria = computed(
    () => `Binding lab, ${this.theme()} theme${this.dense() ? ', dense' : ''}`,
  );

  private readonly recipesPanel = viewChild(RecipePanel);
  private readonly panels = viewChildren(RecipePanel);
  private readonly cards = viewChildren(RecipeCard);
  private readonly filterInput = viewChild<ElementRef<HTMLInputElement>>('filterInput');
  private readonly dynamicHost = viewChild('dynamicHost', { read: ViewContainerRef });

  protected readonly panelCount = computed(() => this.panels().length);
  protected readonly cardCount = computed(() => this.cards().length);

  protected readonly promoComponent = computed(
    (): Type<RecipeTipBanner | RecipeEmptyState> =>
      this.showTip() ? RecipeTipBanner : RecipeEmptyState,
  );

  protected readonly promoInputs = computed(() =>
    this.showTip()
      ? {
          title: 'Outlet tip',
          body: 'Use NgComponentOutlet when the component type is chosen at runtime.',
        }
      : {
          title: 'Tip hidden',
          hint: 'Toggled back to RecipeEmptyState via NgComponentOutlet.',
          compact: true,
        },
  );

  private addTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    afterNextRender(() => {
      this.status.set(`afterNextRender: ${this.cardCount()} card(s) in the DOM.`);
    });

    this.destroyRef.onDestroy(() => {
      if (this.addTimer !== undefined) {
        clearTimeout(this.addTimer);
      }
    });
  }

  protected togglePromo(): void {
    this.showTip.update((v) => !v);
    this.status.set(
      this.showTip()
        ? 'NgComponentOutlet → RecipeTipBanner'
        : 'NgComponentOutlet → RecipeEmptyState',
    );
  }

  protected spawnDynamicCard(): void {
    const host = this.dynamicHost();
    if (!host) {
      return;
    }

    host.clear();
    host.createComponent(RecipeCard, {
      bindings: [
        inputBinding('name', () => 'Dynamic Miso Soup'),
        inputBinding('summary', () => 'Created with ViewContainerRef + inputBinding'),
        inputBinding('minutes', () => 15),
        inputBinding('featured', () => true),
        outputBinding('selected', (name: string) => this.onRecipeSelected(name)),
        outputBinding('removed', (name: string) => {
          this.onRecipeRemoved(name);
          host.clear();
        }),
      ],
    });

    this.status.set('ViewContainerRef.createComponent(RecipeCard) with bindings.');
  }

  protected clearDynamicHost(): void {
    this.dynamicHost()?.clear();
    this.status.set('Dynamic host cleared.');
  }

  protected onRecipeSelected(name: string): void {
    this.status.set(`Selected: ${name} · scale to ${this.servings()} servings`);
  }

  protected onRecipeRemoved(name: string): void {
    this.store.removeByName(name);
    this.status.set(`Removed: ${name}`);
  }

  protected onAddPressed(): void {
    this.adding.set(true);
    this.status.set('Add recipe pressed — form comes in a later phase.');
    if (this.addTimer !== undefined) {
      clearTimeout(this.addTimer);
    }
    this.addTimer = setTimeout(() => {
      if (!this.destroyRef.destroyed) {
        this.adding.set(false);
      }
    }, 800);
  }

  protected focusFirstPanelAdd(): void {
    this.recipesPanel()?.focusAddButton();
    this.status.set('Focused Add via viewChild(RecipePanel) → contentChild(button).');
  }

  protected focusFilter(): void {
    this.filterInput()?.nativeElement.focus();
    this.status.set('Template var #filterInput → ElementRef.focus()');
  }

  protected cycleTheme(): void {
    this.theme.update((t) => (t === 'warm' ? 'cool' : 'warm'));
    this.status.set(`Theme → ${this.theme()} (class + style bindings).`);
  }

  protected onFilterEnter(): void {
    this.status.set(`Filter committed: "${this.filterQuery()}"`);
  }

  protected clearFilter(): void {
    this.store.clearFilter();
    this.status.set('Filter cleared (keyup.escape / Esc).');
  }

  protected onAddAnchorClick(event: MouseEvent): void {
    event.preventDefault();
    this.focusFirstPanelAdd();
    this.status.set('Anchor click: preventDefault + focus Add.');
  }

  protected onWindowEscape(): void {
    if (this.filterQuery()) {
      this.clearFilter();
      return;
    }
    this.status.set('window:keydown.escape (host listener).');
  }
}
