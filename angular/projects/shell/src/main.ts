import { initFederation } from '@angular-architects/native-federation';

initFederation('federation.manifest.json')
  .catch((err) => console.error(err))
  .then((federation) => {
    if (!federation) {
      throw new Error('Native Federation failed to initialize');
    }
    return import('./bootstrap').then((m) => m.bootstrap(federation));
  })
  .catch((err) => console.error(err));
