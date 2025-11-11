import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { IProduct } from '../../interfaces/IProduct';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit {
  product: IProduct | null = null;
  selectedImage: string = '';

  constructor(
    private route: ActivatedRoute,
    private title: Title,
    private meta: Meta
  ) {}

  ngOnInit() {
    this.product = this.route.snapshot.data['product'];
    if (this.product) {
      // Set default selected image
      this.selectedImage = this.product.images && this.product.images.length > 0 
        ? this.product.images[0] 
        : this.product.thumbnail || '';
      
      // Set SEO meta tags — will be included in server HTML
      this.title.setTitle(this.product.title + ' | My Shop');
      this.meta.updateTag({ name: 'description', content: this.product.description || '' });
      
      // Set Open Graph image meta tag
      const productImageUrl = this.product.images && this.product.images.length > 0 
        ? this.product.images[0] 
        : this.product.thumbnail || '';
      
      if (productImageUrl) {
        this.meta.updateTag({ property: 'og:image', content: productImageUrl });
        this.meta.updateTag({ property: 'og:title', content: this.product.title });
        this.meta.updateTag({ property: 'og:description', content: this.product.description || '' });
      }
    }
  }

  selectImage(image: string) {
    this.selectedImage = image;
  }
}
