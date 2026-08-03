import {signalStore,withState, withMethods, patchState} from '@ngrx/signals';
import { Product } from '../../../core/api/product-api.types';
import { inject } from '@angular/core';
import { ProductApiService } from '../../../core/api/product-api.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { of , exhaustMap, pipe, tap, catchError, switchMap, exhaust } from 'rxjs';

type catalogeState = {
    catalogList: Product[];
    isLoading: boolean;
    catalog: Product | null;
}

const initialState: catalogeState = {
    catalogList:[],
    isLoading: false,
    catalog: null
}

export const CatalogStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods((store)=>{
       const catalogApi = inject(ProductApiService);
        return{
            loadCatalog: rxMethod<void>(
                pipe(
                    tap(()=> patchState(store, {isLoading: true})),
                    exhaustMap(()=>
                     catalogApi.getProducts().pipe(
                        tap({
                            next: (products)=> patchState(store, {catalogList: products}),
                            error: (error)=> console.error('Error loading catalog', error),
                            complete: ()=> patchState(store, {isLoading: false})
                        })
                     )
                    
                    ),
                    catchError(()=>{
                        return of([]);
                    })
                )
            ),
            loadCatalog1(){
                //avoid its old school way of doing things
                catalogApi.getProducts().subscribe({
                    next: (products)=> patchState(store, {catalogList: products}),
                    error: (error)=> console.error('Error loading catalog', error),
                    complete: ()=> patchState(store, {isLoading: false})
                })
            },
            loadCatalog2(){
                //its wrong DI is not available in this context as its created on client side
                return rxMethod<void>(
                    pipe(
                        tap(()=> patchState(store, {isLoading: true})),
                        exhaustMap(()=>catalogApi.getProducts()),
                        tap({
                            next: (products)=> patchState(store, {catalogList: products}),
                            error: (error)=> console.error('Error loading catalog', error),
                            complete: ()=> patchState(store, {isLoading: false})
                        }),
                        catchError(()=>{
                            return of([]);
                        })
                    )
                )
            },
            loadProductsAsync : rxMethod<void>(
                pipe(
                    tap(()=> patchState(store, {isLoading: true})),
                    exhaustMap(()=> catalogApi.getProducts()),
                    tap((products)=>patchState(store,{isLoading: false, catalogList: products})),
                    catchError(()=>{
                        return of([]);
                    })
                )
            ),
            loadProductbyIdAsync : rxMethod<number>(
                pipe(
                    tap(()=> patchState(store, {isLoading: true})),
                    exhaustMap((id: number)=>catalogApi.getProduct(id)),
                    tap((catalog)=>patchState(store,{isLoading: false, catalog: catalog}))
                )
            )
        }
    }),

)