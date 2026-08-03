import { Component } from '@angular/core';
import { CatalogComponent } from './feature/catalog/catalog.component';

@Component({
    selector: 'app-my-store',
    template: `<app-catalog></app-catalog>`,
    standalone: true,
    imports: [CatalogComponent],
})
export class MyStoreComponent {}