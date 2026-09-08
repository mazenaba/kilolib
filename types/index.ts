export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    unit: string;
    weightOptions: string[];
    category: string;
    image: string;
    inStock: boolean;
    badge?: string;
    rating: number;
    reviewCount: number;
}

export interface CartItem {
    product: Product;
    quantity: number;
    selectedWeight: string;
}

export interface Category {
    id: string;
    name: string;
    icon: string;
}