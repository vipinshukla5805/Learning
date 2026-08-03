import { Component } from '@angular/core';
import { PageHeader } from '@store/ui';

@Component({
  selector: 'app-home',
  imports: [PageHeader],
  template: `
    <store-page-header
      title="Online Store Shell"
      subtitle="Native Federation host — remotes load below via host routes."
    />
    <ul>
      <li>Shell owns auth session + cart store implementations</li>
      <li>Remotes inject contracts from <code>@store/*</code> shared libs</li>
      <li>Use the nav to load catalog, cart, and checkout remotes</li>
    </ul>
  `,
})
export class Home {}
