export type QuotationStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'CONVERTED';

export interface QuotationLineRequest {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface QuotationLineResponse {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  tvaRate: number;
  totalHT: number;
  totalTTC: number;
}

export interface QuotationRequest {
  quotationDate: string;
  validUntil?: string;
  customerId: number;
  prefix?: string;
  discountTotal: number;
  tvaExempt: boolean;
  attachment?: string;
  lines: QuotationLineRequest[];
}

export interface QuotationResponse {
  id: number;
  numero: string;
  prefix?: string;
  quotationDate: string;
  validUntil?: string;
  totalHT: number;
  discountTotal: number;
  totalTVA: number;
  totalTTC: number;
  status: QuotationStatus;
  tvaExempt: boolean;
  attachment?: string;
  customerId: number;
  customerName: string;
  orderId?: number;
  orderNumero?: string;
  invoiceId?: number;
  invoiceNumero?: string;
  lines: QuotationLineResponse[];
  createdAt: string;
  updatedAt: string;
}
