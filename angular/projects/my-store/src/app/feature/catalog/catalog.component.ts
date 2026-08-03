import { Component, inject, OnInit } from '@angular/core';
import { CatalogStore } from './data-access/product.store';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-catalog',
    standalone: true,
    imports: [CommonModule],
    template: `
    <ng-container>
     @if(catalogStore.isLoading()) {
        <p>Loading...</p>
     } @else {
        <p>Products: {{catalogStore.catalogList().length}}</p>
     }
     <button (click)="getProducts()">Get Products</button>
     <button (click)="loadProductsAsync()">Load Products Async</button>
     <button (click)="loadProductbyIdAsync(1)">Load Product by Id Async</button>
     <p>Product: {{catalogStore.catalog()?.title}}</p>
    </ng-container>
    `
})

export class CatalogComponent{
    catalogStore = inject(CatalogStore);

    getProducts (){
        this.catalogStore.loadCatalog();
    }

    loadProductsAsync (){
        this.catalogStore.loadProductsAsync();
    }

    loadProductbyIdAsync (id: number){
        this.catalogStore.loadProductbyIdAsync(id);
    }
}