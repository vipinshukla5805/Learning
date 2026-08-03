import { InjectionToken, Signal } from '@angular/core';

/**
 * Cross-remote cart port (no UI).
 * Owner: shell provides the writable store; remotes use commands/queries only.
 */
export interface CartLine {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

export interface CartStore {
  readonly lines: Signal<readonly CartLine[]>;
  readonly itemCount: Signal<number>;
  readonly subtotal: Signal<number>;
  addItem(line: Omit<CartLine, 'quantity'> & { quantity?: number }): void;
  removeItem(productId: string): void;
  updateQuantity(productId: string, quantity: number): void;
  clear(): void;
}

export const CART_STORE = new InjectionToken<CartStore>('CART_STORE');
