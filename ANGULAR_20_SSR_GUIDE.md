# The Complete Guide to Angular 20 Server-Side Rendering (SSR) with Vercel Deployment

## Table of Contents
1. [Introduction](#introduction)
2. [What is Server-Side Rendering?](#what-is-server-side-rendering)
3. [Why Angular SSR?](#why-angular-ssr)
4. [Project Setup](#project-setup)
5. [Configuration Deep Dive](#configuration-deep-dive)
6. [Building the Application](#building-the-application)
7. [Deploying to Vercel](#deploying-to-vercel)
8. [Social Media Meta Tags](#social-media-meta-tags)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)
11. [Conclusion](#conclusion)

---

## Introduction

Angular 20 brings significant improvements to Server-Side Rendering (SSR), making it easier than ever to build high-performance, SEO-friendly applications. This comprehensive guide will walk you through setting up Angular SSR from scratch, configuring it for production, and deploying it to Vercel with proper social media sharing support.

Whether you're building an e-commerce platform, a blog, or any content-heavy application, SSR ensures your pages are fully rendered on the server, providing better SEO, faster initial page loads, and improved social media sharing capabilities.

---

## What is Server-Side Rendering?

Server-Side Rendering (SSR) is a technique where web pages are rendered on the server before being sent to the client's browser. Unlike traditional Client-Side Rendering (CSR), where JavaScript runs in the browser to generate content, SSR generates the complete HTML on the server.

### How SSR Works

1. **User Request**: A user navigates to your application URL
2. **Server Processing**: The server receives the request and runs your Angular application
3. **HTML Generation**: Angular renders the components and generates complete HTML
4. **Response**: The fully rendered HTML is sent to the browser
5. **Hydration**: Angular "hydrates" the page, attaching event listeners and making it interactive

### SSR vs CSR Comparison

| Aspect | Client-Side Rendering (CSR) | Server-Side Rendering (SSR) |
|--------|---------------------------|---------------------------|
| Initial Load | Shows blank page, then content | Shows content immediately |
| SEO | Poor (search engines see empty HTML) | Excellent (full HTML content) |
| Social Sharing | No preview cards | Rich preview cards |
| Time to First Byte | Fast | Slightly slower |
| Time to Interactive | Slower | Faster perceived performance |
| Server Load | Low | Higher |

---

## Why Angular SSR?

### Benefits

1. **SEO Optimization**: Search engines can crawl and index your content immediately
2. **Social Media Sharing**: Rich preview cards on WhatsApp, Facebook, Twitter, etc.
3. **Performance**: Faster perceived load times, especially on slower devices
4. **Accessibility**: Content is available even if JavaScript fails to load
5. **Better Core Web Vitals**: Improved Largest Contentful Paint (LCP) scores

### When to Use SSR

- ✅ E-commerce websites
- ✅ Content-heavy applications (blogs, news sites)
- ✅ Public-facing pages that need SEO
- ✅ Applications requiring social media sharing
- ✅ Pages with dynamic content based on routes

### When NOT to Use SSR

- ❌ Internal dashboards (no SEO needed)
- ❌ Highly interactive applications with minimal content
- ❌ Applications with strict server resource constraints

---

## Project Setup

### Prerequisites

- Node.js 18+ and npm
- Angular CLI 20+
- Basic knowledge of Angular and TypeScript

### Step 1: Create a New Angular Project

```bash
ng new angular-ssr --routing --style=css
cd angular-ssr
```

### Step 2: Add SSR Support

Angular 20 makes SSR setup incredibly simple:

```bash
ng add @angular/ssr
```

This command automatically:
- Installs `@angular/ssr` package
- Creates `server.ts` file
- Updates `angular.json` with SSR configuration
- Creates `app.config.server.ts`
- Sets up the necessary build configurations

### Step 3: Install Additional Dependencies

```bash
npm install express
npm install --save-dev @types/express
```

---

## Configuration Deep Dive

### 1. Angular Configuration (`angular.json`)

The key SSR configuration in `angular.json`:

```json
{
  "projects": {
    "angular-ssr": {
      "architect": {
        "build": {
          "builder": "@angular/build:application",
          "options": {
            "browser": "src/main.ts",
            "server": "src/main.server.ts",
            "outputMode": "server",
            "ssr": {
              "entry": "src/server.ts"
            }
          }
        }
      }
    }
  }
}
```

**Key Points:**
- `outputMode: "server"` - Enables SSR build
- `server` - Points to your server entry point
- `ssr.entry` - Your Express server configuration

### 2. Server Configuration (`src/server.ts`)

This is the heart of your SSR setup:

```typescript
import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// Serve static files from /browser
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

// Handle all other requests by rendering the Angular application
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

// Start the server if this module is the main entry point
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// Export request handler for serverless functions
export const reqHandler = createNodeRequestHandler(app);
export default app;
```

**What This Does:**
- Creates an Express server
- Serves static files from the `browser` folder
- Handles all routes through Angular's SSR engine
- Exports handlers for serverless deployment

### 3. Server Routes Configuration (`src/app/app.routes.server.ts`)

Control which routes use SSR:

```typescript
import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender  // Prerender all routes
  },
  {
    path: 'products',
    renderMode: RenderMode.Server  // Server-render products
  },
  {
    path: 'product/:id',
    renderMode: RenderMode.Server  // Server-render product details
  }
];
```

**Render Modes:**
- `RenderMode.Server` - Render on-demand on the server
- `RenderMode.Prerender` - Pre-render at build time
- `RenderMode.Client` - Client-side only

### 4. Server Application Config (`src/app/app.config.server.ts`)

```typescript
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes))
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
```

---

## Building the Application

### Development Build

```bash
ng build
```

This creates:
- `dist/angular-ssr/browser/` - Client-side static files
- `dist/angular-ssr/server/` - Server-side code

### Production Build

```bash
ng build --configuration production
```

### Testing Locally

```bash
npm run serve:ssr:angular-ssr
```

Or:

```bash
node dist/angular-ssr/server/server.mjs
```

Visit `http://localhost:4000` to see your SSR application.

---

## Deploying to Vercel

Vercel is an excellent platform for deploying Angular SSR applications. Here's the complete setup:

### 1. Vercel Configuration (`vercel.json`)

```json
{
  "version": 2,
  "public": true,
  "name": "angular-ssr",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api/index"
    }
  ],
  "functions": {
    "api/index.js": {
      "includeFiles": "dist/angular-ssr/**"
    }
  }
}
```

**Configuration Breakdown:**
- `rewrites` - Routes all requests to the API handler
- `functions` - Configures the serverless function
- `includeFiles` - Includes the entire dist folder in the function

### 2. API Handler (`api/index.js`)

Create `api/index.js` in your project root:

```javascript
export default async function handler(req, res) {
  try {
    const serverModule = await import('../dist/angular-ssr/server/server.mjs');
    
    // Angular's new builder exports the server differently
    const server = serverModule.default || serverModule.app || serverModule;
    
    if (typeof server === 'function') {
      return server(req, res);
    } else if (server && typeof server.handle === 'function') {
      return server.handle(req, res);
    } else {
      throw new Error('Server module does not export a valid handler');
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).send('Internal Server Error: ' + error.message);
  }
}
```

**What This Does:**
- Imports the built server module
- Handles different export formats
- Provides error handling

### 3. Deployment Steps

1. **Build your application:**
   ```bash
   npm run build
   ```

2. **Initialize Git (if not already):**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

3. **Deploy to Vercel:**
   ```bash
   npx vercel
   ```
   
   Or connect your GitHub repository to Vercel for automatic deployments.

### 4. Environment Variables

If you need to access your deployment URL in SSR, set environment variables in Vercel:

- Go to your project settings
- Navigate to Environment Variables
- Add `VERCEL_URL` (automatically provided) or create custom variables

---

## Social Media Meta Tags

One of the biggest advantages of SSR is proper social media sharing. Here's how to implement it:

### 1. Update `index.html`

Add default meta tags to your `src/index.html`:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>My Shop - Products</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Browse our wide selection of products">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="My Shop - Products">
  <meta property="og:description" content="Browse our wide selection of products">
  <meta property="og:site_name" content="My Shop">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="My Shop - Products">
  <meta name="twitter:description" content="Browse our wide selection of products">
</head>
<body>
  <app-root></app-root>
</body>
</html>
```

### 2. Dynamic Meta Tags in Components

For dynamic content (like product pages), update meta tags programmatically:

```typescript
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
      const productImageUrl = this.product.images?.[0] || this.product.thumbnail || '';
      const currentUrl = this.getCurrentUrl();
      
      // Set page title
      this.title.setTitle(`${this.product.title} | My Shop`);
      
      // Remove existing meta tags
      this.removeExistingMetaTags();
      
      // Basic SEO
      this.meta.updateTag({ 
        name: 'description', 
        content: this.product.description || '' 
      });
      
      // Open Graph tags
      this.meta.updateTag({ property: 'og:type', content: 'product' });
      this.meta.updateTag({ property: 'og:title', content: this.product.title });
      this.meta.updateTag({ 
        property: 'og:description', 
        content: this.product.description || '' 
      });
      this.meta.updateTag({ property: 'og:url', content: currentUrl });
      this.meta.updateTag({ property: 'og:site_name', content: 'My Shop' });
      
      if (productImageUrl) {
        this.meta.updateTag({ property: 'og:image', content: productImageUrl });
        this.meta.updateTag({ property: 'og:image:width', content: '1200' });
        this.meta.updateTag({ property: 'og:image:height', content: '630' });
        this.meta.updateTag({ property: 'og:image:type', content: 'image/webp' });
      }
      
      // Product-specific tags
      if (this.product.price) {
        this.meta.updateTag({ 
          property: 'product:price:amount', 
          content: this.product.price.toString() 
        });
        this.meta.updateTag({ 
          property: 'product:price:currency', 
          content: 'INR' 
        });
      }
      
      // Twitter Card tags
      this.meta.updateTag({ 
        name: 'twitter:card', 
        content: 'summary_large_image' 
      });
      this.meta.updateTag({ 
        name: 'twitter:title', 
        content: this.product.title 
      });
      this.meta.updateTag({ 
        name: 'twitter:description', 
        content: this.product.description || '' 
      });
      if (productImageUrl) {
        this.meta.updateTag({ 
          name: 'twitter:image', 
          content: productImageUrl 
        });
      }
    }
  }

  private getCurrentUrl(): string {
    if (isPlatformBrowser(this.platformId)) {
      return this.document.location.origin + this.router.url;
    }
    // For SSR, construct URL
    const baseUrl = typeof process !== 'undefined' && process.env?.['VERCEL_URL']
      ? `https://${process.env['VERCEL_URL']}`
      : 'https://your-domain.vercel.app'; // Replace with your domain
    
    return baseUrl + this.router.url;
  }

  private removeExistingMetaTags(): void {
    const ogTags = [
      'og:title', 'og:description', 'og:image', 'og:url', 
      'og:type', 'og:site_name', 'og:image:width', 
      'og:image:height', 'og:image:type', 
      'product:price:amount', 'product:price:currency'
    ];
    
    ogTags.forEach(tag => {
      const existingTag = this.meta.getTag(`property="${tag}"`);
      if (existingTag) {
        this.meta.removeTagElement(existingTag);
      }
    });
    
    const twitterTags = [
      'twitter:card', 'twitter:title', 
      'twitter:description', 'twitter:image'
    ];
    
    twitterTags.forEach(tag => {
      const existingTag = this.meta.getTag(`name="${tag}"`);
      if (existingTag) {
        this.meta.removeTagElement(existingTag);
      }
    });
  }
}
```

### 3. Testing Social Media Previews

After deployment, test your meta tags:

- **Facebook Debugger**: https://developers.facebook.com/tools/debug/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
- **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/
- **WhatsApp**: Share the link directly to see the preview

---

## Best Practices

### 1. Route Resolvers

Use route resolvers to fetch data before rendering:

```typescript
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { ProductsService } from '../services/products';
import { IProduct } from '../interfaces/IProduct';

@Injectable({ providedIn: 'root' })
export class ProductResolver implements Resolve<IProduct | null> {
  constructor(private productsService: ProductsService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IProduct | null> {
    const id = route.paramMap.get('id')!;
    return this.productsService.getProductById(id);
  }
}
```

Then in your routes:

```typescript
{
  path: 'product/:id',
  loadComponent: () => import('./components/product-detail/product-detail')
    .then(m => m.ProductDetail),
  resolve: { product: ProductResolver }
}
```

### 2. Avoid Browser-Only APIs

Check for browser environment before using browser APIs:

```typescript
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';

constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

someMethod() {
  if (isPlatformBrowser(this.platformId)) {
    // Safe to use window, localStorage, etc.
    window.localStorage.setItem('key', 'value');
  }
}
```

### 3. Optimize Images

- Use WebP format for better compression
- Implement lazy loading for images
- Use responsive images with `srcset`

### 4. Error Handling

Implement proper error handling in your server:

```typescript
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch((error) => {
      console.error('SSR Error:', error);
      // Fallback to client-side rendering or error page
      res.status(500).send('Error rendering page');
    });
});
```

### 5. Caching Strategy

Implement caching for static assets and API responses:

```typescript
// Static files - long cache
app.use(express.static(browserDistFolder, {
  maxAge: '1y',
  immutable: true
}));

// API responses - shorter cache
app.get('/api/products', (req, res) => {
  res.set('Cache-Control', 'public, max-age=3600');
  // ... return data
});
```

### 6. Performance Monitoring

Monitor your SSR performance:

```typescript
app.use((req, res, next) => {
  const start = Date.now();
  angularApp.handle(req).then((response) => {
    const duration = Date.now() - start;
    console.log(`SSR took ${duration}ms for ${req.url}`);
    if (response) {
      writeResponseToNodeResponse(response, res);
    } else {
      next();
    }
  }).catch(next);
});
```

---

## Troubleshooting

### Issue 1: 404 Errors on Vercel

**Problem**: Getting 404 errors after deployment.

**Solution**: 
- Ensure `vercel.json` is in the root directory
- Check that `api/index.js` exists
- Verify the build output includes `dist/angular-ssr/` folder
- Make sure `includeFiles` in `vercel.json` points to the correct path

### Issue 2: Meta Tags Not Showing

**Problem**: Social media previews not working.

**Solution**:
- Verify meta tags are set in `ngOnInit` (not `constructor`)
- Check that the URL in `og:url` is absolute (not relative)
- Ensure images are publicly accessible (not behind authentication)
- Clear cache in social media debuggers

### Issue 3: Build Errors

**Problem**: Build fails with module not found errors.

**Solution**:
- Run `npm install` to ensure all dependencies are installed
- Check that `@angular/ssr` is installed: `npm list @angular/ssr`
- Verify Node.js version is 18+

### Issue 4: Slow SSR Performance

**Problem**: SSR is slow.

**Solution**:
- Use route resolvers to fetch data efficiently
- Implement caching for API calls
- Consider prerendering static routes
- Optimize images and assets

### Issue 5: Environment Variables Not Working

**Problem**: `process.env` is undefined in SSR.

**Solution**:
- Use `typeof process !== 'undefined'` checks
- Set environment variables in Vercel dashboard
- Use `VERCEL_URL` for automatic URL detection

---

## Conclusion

Angular 20 SSR provides a powerful, production-ready solution for building SEO-friendly, high-performance web applications. With the configuration outlined in this guide, you can:

✅ Deploy Angular SSR applications to Vercel seamlessly  
✅ Implement proper social media sharing with rich previews  
✅ Optimize for search engines  
✅ Deliver fast, interactive user experiences  

### Key Takeaways

1. **SSR is Essential** for public-facing applications requiring SEO
2. **Vercel Integration** is straightforward with the right configuration
3. **Meta Tags** must be set dynamically for proper social sharing
4. **Performance** can be optimized with caching and route resolvers
5. **Testing** is crucial - use social media debuggers before going live

### Next Steps

- Implement incremental static regeneration for dynamic content
- Add analytics to track SSR performance
- Set up monitoring and error tracking
- Optimize images and implement lazy loading
- Consider implementing ISR (Incremental Static Regeneration) for frequently updated content

### Resources

- [Angular SSR Documentation](https://angular.dev/guide/ssr)
- [Vercel Documentation](https://vercel.com/docs)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)

---

**Happy Coding! 🚀**

If you found this guide helpful, please share it with your network. For questions or contributions, feel free to open an issue or submit a pull request.

