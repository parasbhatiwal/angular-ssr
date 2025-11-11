import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProductsService } from '../../services/products';
import { IProduct } from '../../interfaces/IProduct';

@Injectable({ providedIn: 'root' })
export class ProductResolver implements Resolve<IProduct | null> {
    constructor(private productsService: ProductsService) { }

    resolve(route: ActivatedRouteSnapshot): Observable<IProduct | null> {
        const id = route.paramMap.get('id')!;
        return this.productsService.getProductById(id).pipe(
            catchError(err => {
                // handle error (log, show fallback)
                return of(null);
            })
        );
    }
}
