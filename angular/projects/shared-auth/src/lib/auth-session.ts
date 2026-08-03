import { InjectionToken, Signal } from '@angular/core';

/**
 * Cross-remote auth contract.
 * Owner: shell provides the implementation; remotes only inject AUTH_SESSION.
 */
export interface AuthUser {
  id: string;
  displayName: string;
  email: string;
}

export interface AuthSession {
  readonly user: Signal<AuthUser | null>;
  readonly isAuthenticated: Signal<boolean>;
  login(email: string, displayName?: string): void;
  logout(): void;
}

export const AUTH_SESSION = new InjectionToken<AuthSession>('AUTH_SESSION');
