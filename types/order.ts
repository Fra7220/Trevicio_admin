// types/order.ts

export type ProductType = {
  _id: string;
  title?: string;
  price?: number;
};

export type OrderItemType = {
  _id: string;
  product: ProductType; // guaranteed non-null
  title: string;
  price: number;
  color: string;
  size: string;
  quantity: number;
};

export type CustomerType = {
  _id: string | null;
  clerkId: string | null;
  name: string;
  email: string;
  address: string;
};

export type OrderType = {
  _id: string;
  customerClerkId: string;
  products: OrderItemType[];
  totalAmount: number;
  paymentMethod?: string;
  address?: string;
  createdAt?: string;
  customer: CustomerType;
};
