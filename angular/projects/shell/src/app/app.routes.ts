import { Routes } from '@angular/router';
import type { NativeFederationResult } from '@angular-architects/native-federation';
import { Home } from './home/home';

type LoadRemoteModule = NativeFederationResult['loadRemoteModule'];

interface CatalogRemoteModule {
  CATALOG_ROUTES: Routes;
}

interface CartRemoteModule {
  CART_ROUTES: Routes;
}

interface CheckoutRemoteModule {
  CHECKOUT_ROUTES: Routes;
}

interface RecipeBoxRemoteModule {
  RECIPE_BOX_ROUTES: Routes;
}

interface MyStoreRemoteModule {
  MY_STORE_ROUTES: Routes;
}

export function createRoutes(loadRemoteModule: LoadRemoteModule): Routes {
  return [
    {
      path: '',
      component: Home,
      pathMatch: 'full',
    },
    {
      path: 'catalog',
      loadChildren: () =>
        loadRemoteModule<CatalogRemoteModule>('catalog', './Routes').then(
          (m) => m.CATALOG_ROUTES,
        ),
    },
    {
      path: 'cart',
      loadChildren: () =>
        loadRemoteModule<CartRemoteModule>('cart', './Routes').then((m) => m.CART_ROUTES),
    },
    {
      path: 'checkout',
      loadChildren: () =>
        loadRemoteModule<CheckoutRemoteModule>('checkout', './Routes').then(
          (m) => m.CHECKOUT_ROUTES,
        ),
    },
    {
      path: 'recipe-box',
      loadChildren: () =>
        loadRemoteModule<RecipeBoxRemoteModule>('recipe-box', './Routes').then(
          (m) => m.RECIPE_BOX_ROUTES,
        ),
    },
    {
      path: 'my-store',
      loadChildren:()=>
        loadRemoteModule<MyStoreRemoteModule>('my-store', './Routes').then(
          (m)=>m.MY_STORE_ROUTES
        ),
    },
    {
      path: '**',
      redirectTo: '',
    },
  ];
}
