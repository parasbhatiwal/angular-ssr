// Product Interface
export interface IProduct {
    id: number;
    title: string;
    description: string;
    category: string;
    price: number;
    discountPercentage: number;
    rating: number;
    stock: number;
    tags: string[];
    brand: string;
    sku: string;
    weight: number;
    dimensions: IDimensions;
    warrantyInformation: string;
    shippingInformation: string;
    availabilityStatus: string;
    reviews: IReview[];
    returnPolicy: string;
    minimumOrderQuantity: number;
    meta: IMetaData;
    images: string[];
    thumbnail: string;
  }
  
  // Dimensions Interface
  export interface IDimensions {
    width: number;
    height: number;
    depth: number;
  }
  
  // Review Interface
  export interface IReview {
    rating: number;
    comment: string;
    date: string; // ISO timestamp
    reviewerName: string;
    reviewerEmail: string;
  }
  
  // Meta Data Interface
  export interface IMetaData {
    createdAt: string; // ISO timestamp
    updatedAt: string; // ISO timestamp
    barcode: string;
    qrCode: string;
  }
  