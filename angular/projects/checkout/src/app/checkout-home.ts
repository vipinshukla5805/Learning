import { Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { PageHeader } from '@store/ui';
import { AUTH_SESSION } from '@store/auth';
import { CART_STORE } from '@store/cart-api';

@Component({
  selector: 'app-checkout-home',
  imports: [PageHeader, DecimalPipe],
  template: `
    <store-page-header
      title="Checkout remote"
      subtitle="Depends on AUTH_SESSION + CART_STORE owned by the shell."
    />
    @if (!auth.isAuthenticated()) {
      <p>Please use <strong>Demo login</strong> in the shell header before checkout.</p>
    } @else if (cart.itemCount() === 0) {
      <p>Hello {{ auth.user()?.displayName }}. Your cart is empty.</p>
    } @else {
      <p>Checkout as {{ auth.user()?.displayName }} ({{ auth.user()?.email }})</p>
      <p>Items: {{ cart.itemCount() }} · Subtotal: {{ cart.subtotal() | number: '1.2-2' }}</p>
      <button type="button" (click)="placeOrder()">Place order (stub)</button>
      @if (orderPlaced) {
        <p>Order accepted (stub). Cart cleared.</p>
      }
    }
  `,
})
export class CheckoutHome {
  protected readonly auth = inject(AUTH_SESSION);
  protected readonly cart = inject(CART_STORE);
  protected orderPlaced = false;

  protected placeOrder(): void {
    this.cart.clear();
    this.orderPlaced = true;
  }
}
