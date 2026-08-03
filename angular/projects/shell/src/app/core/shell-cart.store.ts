import { computed, Injectable, signal } from '@angular/core';
import { CartLine, CartStore } from '@store/cart-api';

@Injectable()
export class ShellCartStore implements CartStore {
  private readonly linesState = signal<CartLine[]>([]);

  readonly lines = this.linesState.asReadonly();
  readonly itemCount = computed(() =>
    this.linesState().reduce((sum, line) => sum + line.quantity, 0),
  );
  readonly subtotal = computed(() =>
    this.linesState().reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
  );

  addItem(line: Omit<CartLine, 'quantity'> & { quantity?: number }): void {
    const quantity = line.quantity ?? 1;
    this.linesState.update((lines) => {
      const existing = lines.find((l) => l.productId === line.productId);
      if (existing) {
        return lines.map((l) =>
          l.productId === line.productId
            ? { ...l, quantity: l.quantity + quantity }
            : l,
        );
      }
      return [...lines, { ...line, quantity }];
    });
  }

  removeItem(productId: string): void {
    this.linesState.update((lines) => lines.filter((l) => l.productId !== productId));
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }
    this.linesState.update((lines) =>
      lines.map((l) => (l.productId === productId ? { ...l, quantity } : l)),
    );
  }

  clear(): void {
    this.linesState.set([]);
  }
}
