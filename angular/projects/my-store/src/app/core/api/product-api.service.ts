import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from './product-api.types';

@Injectable({
    providedIn: 'root'
})
export class ProductApiService {
    private readonly http = inject(HttpClient)
    private readonly apiUrl = 'https://fakestoreapi.com/products';
    getProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(this.apiUrl);
    }

    getProduct(id: number): Observable<Product> {
        return this.http.get<Product>(`${this.apiUrl}/${id}`);
    }
}