import { Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { PageHeader } from '@store/ui';
import { CART_STORE } from '@store/cart-api';

@Component({
  selector: 'app-cart-home',
  imports: [PageHeader, DecimalPipe],
  template: `
    <store-page-header
      title="Cart remote"
      subtitle="Reads/writes the shell-provided CART_STORE singleton."
    />
    @if (cart.lines().length === 0) {
      <p>Cart is empty. Add items from Catalog.</p>
    } @else {
      <ul>
        @for (line of cart.lines(); track line.productId) {
          <li>
            {{ line.name }} × {{ line.quantity }} — {{ line.unitPrice * line.quantity | number: '1.2-2' }}
            <button type="button" (click)="cart.removeItem(line.productId)">Remove</button>
          </li>
        }
      </ul>
      <p><strong>Subtotal:</strong> {{ cart.subtotal() | number: '1.2-2' }}</p>
      <button type="button" (click)="cart.clear()">Clear cart</button>
    }
  `,
})
export class CartHome {
  protected readonly cart = inject(CART_STORE);
}
