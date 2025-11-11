import { Injectable, Inject, PLATFORM_ID, TransferState, makeStateKey } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { isPlatformServer } from '@angular/common';
import { IProduct } from '../interfaces/IProduct';

const PRODUCTS_KEY = makeStateKey<IProduct[]>('products');
const PRODUCT_KEY_PREFIX = 'product-';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private apiBase = 'https://dummyjson.com';

  constructor(
    private http: HttpClient,
    private transferState: TransferState,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  getProducts(): Observable<IProduct[]> {
    const saved = this.transferState.get<IProduct[]>(PRODUCTS_KEY, null as any);
    if (saved) {
      // data was injected from server
      this.transferState.remove(PRODUCTS_KEY);
      return of(saved);
    }

    return this.http.get<{ products: IProduct[] }>(`${this.apiBase}/products`).pipe(
      map(response => response.products),
      tap(data => {
        if (isPlatformServer(this.platformId)) {
          this.transferState.set(PRODUCTS_KEY, data);
        }
      })
    );
  }

  getProductById(id: string): Observable<IProduct> {
    const key = makeStateKey<IProduct>(PRODUCT_KEY_PREFIX + id);
    const saved = this.transferState.get<IProduct>(key, null as any);
    if (saved) {
      this.transferState.remove(key);
      return of(saved);
    }

    return this.http.get<IProduct>(`${this.apiBase}/products/${id}`).pipe(
      tap(data => {
        if (isPlatformServer(this.platformId)) {
          this.transferState.set(key, data);
        }
      })
    );
  }
}
