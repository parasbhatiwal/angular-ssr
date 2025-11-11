import { Routes } from '@angular/router';
import { ProductResolver } from './components/products/product.resolver';

export const routes: Routes = [
    {
        path: 'products',
        loadComponent: () => import('./components/products/products').then(m => m.Products)
    },
    {
        path: 'product/:id',
        loadComponent: () => import('./components/product-detail/product-detail').then(m => m.ProductDetail),
        resolve: { product: ProductResolver } 
    },
    { path: '', redirectTo: 'products', pathMatch: 'full' },
];
