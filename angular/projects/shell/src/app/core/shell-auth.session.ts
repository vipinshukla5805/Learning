import { computed, Injectable, signal } from '@angular/core';
import { AuthSession, AuthUser } from '@store/auth';

@Injectable()
export class ShellAuthSession implements AuthSession {
  private readonly userState = signal<AuthUser | null>(null);

  readonly user = this.userState.asReadonly();
  readonly isAuthenticated = computed(() => this.userState() !== null);

  login(email: string, displayName = 'Store Shopper'): void {
    this.userState.set({
      id: crypto.randomUUID(),
      email,
      displayName,
    });
  }

  logout(): void {
    this.userState.set(null);
  }
}
