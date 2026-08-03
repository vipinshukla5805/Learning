import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import type { NativeFederationResult } from '@angular-architects/native-federation';
import { AUTH_SESSION } from '@store/auth';
import { CART_STORE } from '@store/cart-api';
import { API_BASE_URL } from '@store/data-access';
import { createRoutes } from './app.routes';
import { FEDERATION } from './core/federation.token';
import { ShellAuthSession } from './core/shell-auth.session';
import { ShellCartStore } from './core/shell-cart.store';

export function createAppConfig(federation: NativeFederationResult): ApplicationConfig {
  return {
    providers: [
      provideBrowserGlobalErrorListeners(),
      provideRouter(createRoutes(federation.loadRemoteModule.bind(federation))),
      provideHttpClient(),
      { provide: FEDERATION, useValue: federation },
      { provide: API_BASE_URL, useValue: 'https://api.online-store.local' },
      { provide: AUTH_SESSION, useClass: ShellAuthSession },
      { provide: CART_STORE, useClass: ShellCartStore },
    ],
  };
}
