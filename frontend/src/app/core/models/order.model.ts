export type OrderStatus = 'DRAFT' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED';

export interface OrderLineRequest {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface OrderLineResponse {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  tvaRate: number;
  totalHT: number;
  totalTTC: number;
}

export interface OrderRequest {
  orderDate: string;
  customerId: number;
  prefix?: string;
  discountTotal: number;
  tvaExempt: boolean;
  attachment?: string;
  lines: OrderLineRequest[];
}

export interface OrderResponse {
  id: number;
  numero: string;
  prefix?: string;
  orderDate: string;
  totalHT: number;
  discountTotal: number;
  totalTVA: number;
  totalTTC: number;
  remainingAmount: number;
  status: OrderStatus;
  tvaExempt: boolean;
  attachment?: string;
  customerId: number;
  customerName: string;
  invoiceId?: number;
  invoiceNumero?: string;
  lines: OrderLineResponse[];
  createdAt: string;
  updatedAt: string;
}
