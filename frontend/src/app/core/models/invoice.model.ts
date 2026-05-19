export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface InvoiceLineRequest {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceLineResponse {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  tvaRate: number;
  totalHT: number;
  totalTTC: number;
}

export interface InvoiceRequest {
  invoiceDate: string;
  dueDate?: string;
  customerId: number;
  prefix?: string;
  discountTotal: number;
  tvaExempt: boolean;
  attachment?: string;
  lines: InvoiceLineRequest[];
}

export interface InvoiceResponse {
  id: number;
  numero: string;
  prefix?: string;
  invoiceDate: string;
  dueDate?: string;
  totalHT: number;
  discountTotal: number;
  totalTVA: number;
  totalTTC: number;
  status: InvoiceStatus;
  tvaExempt: boolean;
  attachment?: string;
  customerId: number;
  customerName: string;
  quotationId?: number;
  quotationNumero?: string;
  orderId?: number;
  orderNumero?: string;
  lines: InvoiceLineResponse[];
  createdAt: string;
  updatedAt: string;
}
