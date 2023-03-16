export interface Product {
  availableForSale: boolean;
  createdAt: string;
  description: string;
  descriptionHtml: string;
  featuredImage: Image;
  handle: string;
  id: string;
  images: Images;
  isGiftCard: boolean;
  media: Media;
  onlineStoreUrl: null;
  options: Option[];
  priceRange: PriceRange;
  productType: string;
  publishedAt: string;
  requiresSellingPlan: boolean;
  seo: SEO;
  tags: string[];
  title: string;
  totalInventory: number;
  updatedAt: string;
  variants: Variants;
  vendor: string;
}

export interface Image {
  altText: null | string;
  url: string;
}

export interface Images {
  nodes: Image[];
}

export interface Media {
  nodes: Media[];
}

export interface Media {
  alt: string;
  previewImage: Image;
  mediaContentType: string;
}

export interface Option {
  name: string;
  values: string[];
}

export interface PriceRange {
  minVariantPrice: Price;
  maxVariantPrice: Price;
}

export interface Price {
  amount: string;
  currencyCode: string;
}

export interface SEO {
  title: string;
  description: string;
}

export interface Variants {
  nodes: Variant[];
}

export interface Variant {
  availableForSale: boolean;
  barcode: string;
  compareAtPrice: Price | null;
  currentlyNotInStock: boolean;
  id: string;
  image: Image;
  price: Price;
  quantityAvailable: number;
  requiresShipping: boolean;
  selectedOptions: SelectedOption[];
  sku: string;
  title: string;
  unitPrice: null;
  unitPriceMeasurement: UnitPriceMeasurement;
  weight: number;
  weightUnit: string;
}

export interface SelectedOption {
  name: string;
  value: string;
}

export interface UnitPriceMeasurement {
  measuredType: null;
  quantityValue: number;
  referenceUnit: null;
  quantityUnit: null;
}

export interface Cart {
  id: string;
  totalQuantity: number;
  createdAt: string;
  checkoutUrl: string;
  updatedAt: string;
  discountCodes: Array<{
    applicable: boolean;
    code: string;
  }>;
  cost: {
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
    subtotalAmount: {
      amount: string;
      currencyCode: string;
    };
    checkoutChargeAmount: {
      amount: string;
      currencyCode: string;
    };
  };
  lines: {
    edges: Array<{
      node: {
        id: string;
        quantity: number;
        cost: {
          amountPerQuantity: {
            amount: string;
            currencyCode: string;
          };
          compareAtAmountPerQuantity?: {
            amount: string;
            currencyCode: string;
          };
        };
        merchandise: {
          id: string;
          title: string;
          image: {
            url: string;
          };
          product: {
            title: string;
          };
        };
      };
    }>;
  };
}
