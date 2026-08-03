import { Component, inject } from '@angular/core';
import { PageHeader } from '@store/ui';
import { CART_STORE } from '@store/cart-api';
import { API_BASE_URL } from '@store/data-access';

@Component({
  selector: 'app-catalog-home',
  imports: [PageHeader],
  template: `
    <store-page-header
      title="Catalog remote"
      subtitle="Product API ownership stays in this remote; cart writes go through CART_STORE."
    />
    <p>API base (injected): <code>{{ apiBase }}</code></p>
    <button type="button" (click)="addDemoProduct()">Add demo product to cart</button>
    <p>Cart items (shared store): {{ cart.itemCount() }}</p>
  `,
  styles: `
    button {
      margin: 0.5rem 0 1rem;
      padding: 0.5rem 0.9rem;
      cursor: pointer;
    }
  `,
})
export class CatalogHome {
  protected readonly cart = inject(CART_STORE);
  protected readonly apiBase = inject(API_BASE_URL);

  protected addDemoProduct(): void {
    this.cart.addItem({
      productId: 'sku-1001',
      name: 'Angular Hoodie',
      unitPrice: 49.99,
    });
  }
}
