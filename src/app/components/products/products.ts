import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductsService } from '../../services/products';
import { AsyncPipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-products',
  imports: [RouterLink, AsyncPipe, CommonModule],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products {
  private productsService = inject(ProductsService);

  products$ = this.productsService.getProducts();
}
