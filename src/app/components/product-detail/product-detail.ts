import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
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
    private router: Router,
    private title: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.product = this.route.snapshot.data['product'];
    if (this.product) {
      // Set default selected image
      this.selectedImage = this.product.images && this.product.images.length > 0 
        ? this.product.images[0] 
        : this.product.thumbnail || '';
      
      // Get the product image URL
      const productImageUrl = this.product.images && this.product.images.length > 0 
        ? this.product.images[0] 
        : this.product.thumbnail || '';
      
      // Get current URL
      const currentUrl = this.getCurrentUrl();
      
      // Set page title
      this.title.setTitle(`${this.product.title} | My Shop`);
      
      // Remove existing meta tags first
      this.removeExistingMetaTags();
      
      // Set basic SEO meta tags
      this.meta.updateTag({ name: 'description', content: this.product.description || '' });
      
      // Set Open Graph meta tags
      this.meta.updateTag({ property: 'og:type', content: 'product' });
      this.meta.updateTag({ property: 'og:title', content: this.product.title });
      this.meta.updateTag({ property: 'og:description', content: this.product.description || '' });
      this.meta.updateTag({ property: 'og:url', content: currentUrl });
      this.meta.updateTag({ property: 'og:site_name', content: 'My Shop' });
      
      if (productImageUrl) {
        this.meta.updateTag({ property: 'og:image', content: productImageUrl });
        this.meta.updateTag({ property: 'og:image:width', content: '1200' });
        this.meta.updateTag({ property: 'og:image:height', content: '630' });
        this.meta.updateTag({ property: 'og:image:type', content: 'image/webp' });
      }
      
      // Set product-specific Open Graph tags
      if (this.product.price) {
        this.meta.updateTag({ property: 'product:price:amount', content: this.product.price.toString() });
        this.meta.updateTag({ property: 'product:price:currency', content: 'INR' });
      }
      
      // Set Twitter Card meta tags
      this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
      this.meta.updateTag({ name: 'twitter:title', content: this.product.title });
      this.meta.updateTag({ name: 'twitter:description', content: this.product.description || '' });
      if (productImageUrl) {
        this.meta.updateTag({ name: 'twitter:image', content: productImageUrl });
      }
    }
  }

  private getCurrentUrl(): string {
    if (isPlatformBrowser(this.platformId)) {
      return this.document.location.origin + this.router.url;
    }
    // For SSR, use the router URL
    // Note: Replace 'your-domain.vercel.app' with your actual Vercel deployment URL
    // You can also set this via environment variable in Vercel
    const baseUrl = typeof process !== 'undefined' && process.env?.['VERCEL_URL']
      ? `https://${process.env['VERCEL_URL']}`
      : 'https://angular-ssr-7nvn-git-feat-vercel-6ee7ab-paras-projects-05fe7d00.vercel.app'; // TODO: Replace with your actual domain
    
    return baseUrl + this.router.url;
  }

  private removeExistingMetaTags(): void {
    // Remove existing OG tags
    const ogTags = ['og:title', 'og:description', 'og:image', 'og:url', 'og:type', 'og:site_name', 
                    'og:image:width', 'og:image:height', 'og:image:type', 'product:price:amount', 'product:price:currency'];
    ogTags.forEach(tag => {
      const existingTag = this.meta.getTag(`property="${tag}"`);
      if (existingTag) {
        this.meta.removeTagElement(existingTag);
      }
    });
    
    // Remove existing Twitter tags
    const twitterTags = ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'];
    twitterTags.forEach(tag => {
      const existingTag = this.meta.getTag(`name="${tag}"`);
      if (existingTag) {
        this.meta.removeTagElement(existingTag);
      }
    });
  }

  selectImage(image: string) {
    this.selectedImage = image;
  }
}
