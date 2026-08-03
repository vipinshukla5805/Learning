import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

/** Phase 4 — layout with outlet + nav. */
@Component({
  selector: 'rb-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="nav">
      <a routerLink="./" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Recipes</a>
      <a routerLink="pantry" routerLinkActive="active">Pantry</a>
    </nav>
    <router-outlet />
  `,
  styles: `
    .nav {
      display: flex;
      gap: 0.85rem;
      margin-bottom: 1rem;
      font-size: 0.92rem;
      font-weight: 650;
    }
    a {
      color: var(--rb-muted);
      text-decoration: none;
    }
    a.active,
    a:hover {
      color: var(--rb-accent);
    }
  `,
})
export class RecipeBoxLayout {}
