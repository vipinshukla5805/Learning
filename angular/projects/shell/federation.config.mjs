import { withNativeFederation, shareAll } from '@angular-architects/native-federation/config';

const sharedMappings = [
  '@store/auth',
  '@store/cart-api',
  '@store/data-access',
  '@store/ui',
];

export default withNativeFederation({
  name: 'shell',

  shared: {
    ...shareAll(
      { singleton: true, strictVersion: true, requiredVersion: 'auto', build: 'package' },
      {
        overrides: {
          '@angular/core': {
            singleton: true,
            strictVersion: true,
            requiredVersion: 'auto',
            build: 'package',
            includeSecondaries: { keepAll: true },
          },
        },
      },
    ),
  },

  sharedMappings,

  skip: ['rxjs/ajax', 'rxjs/fetch', 'rxjs/testing', 'rxjs/webSocket'],

  features: {
    denseChunking: true,
  },
});
