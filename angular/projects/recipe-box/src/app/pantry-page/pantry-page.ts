import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PantrySessionService } from '../di/pantry.services';

/** 3.6 — Lazy route; PantrySessionService provided on this route only. */
@Component({
  selector: 'rb-pantry-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="page">
      <h1>Pantry (lazy)</h1>
      <p>Session opened: <code>{{ session.openedAt }}</code></p>
      <p>Touches this instance: <strong>{{ visits }}</strong></p>
      <button type="button" (click)="visits = session.touch()">Touch session</button>
      <p><a routerLink="..">← Recipes</a></p>
    </section>
  `,
  styles: `
    .page {
      max-width: var(--rb-max, 40rem);
    }
    code {
      font-size: 0.85em;
    }
    button {
      margin: 0.5rem 0;
      padding: 0.35rem 0.7rem;
      font: inherit;
      cursor: pointer;
    }
  `,
})
export class PantryPage {
  protected readonly session = inject(PantrySessionService);
  protected visits = this.session.touch();
}
