export interface User {
  id: string;
  username: string;
  email: string;
  role: 'owner' | 'admin' | 'cashier';
  name: string;
}

export interface Product {
  id: string;
  name: string;
  barcode: string;
  qrCode: string;
  price: number;
  stock: number;
  category: string;
  supplier: string;
  description: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
}

export interface Member {
  id: string;
  phone: string;
  name: string;
  points: number;
  totalSpent: number;
  createdAt: Date;
  lastVisit: Date;
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'promptpay';
  cashierId: string;
  cashierName: string;
  memberId?: string;
  memberPhone?: string;
  pointsUsed: number;
  pointsEarned: number;
  createdAt: Date;
}

export interface DashboardStats {
  todayRevenue: number;
  todaySalesCount: number;
  outOfStockCount: number;
  totalProducts: number;
  bestSelling: (Product & { totalSold: number })[];
  outOfStockProducts: Product[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}