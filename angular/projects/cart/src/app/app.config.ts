import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AUTH_SESSION } from '@store/auth';
import { CART_STORE } from '@store/cart-api';
import { API_BASE_URL } from '@store/data-access';
import { CART_ROUTES } from './remote-routes';
import { RemoteDevAuthSession, RemoteDevCartStore } from './dev-providers';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(CART_ROUTES),
    provideHttpClient(),
    { provide: API_BASE_URL, useValue: 'https://api.online-store.local' },
    { provide: AUTH_SESSION, useClass: RemoteDevAuthSession },
    { provide: CART_STORE, useClass: RemoteDevCartStore },
  ],
};
