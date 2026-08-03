import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AUTH_SESSION } from '@store/auth';
import { CART_STORE } from '@store/cart-api';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly auth = inject(AUTH_SESSION);
  protected readonly cart = inject(CART_STORE);

  protected demoLogin(): void {
    this.auth.login('shopper@example.com', 'Demo Shopper');
  }
}
