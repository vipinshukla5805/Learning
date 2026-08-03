import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  styles: `
    :host {
      display: block;
      padding: 1.5rem;
      font-family: 'Segoe UI', system-ui, sans-serif;
    }
  `,
})
export class App {}
