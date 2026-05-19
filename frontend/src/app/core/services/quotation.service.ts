import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { QuotationRequest, QuotationResponse } from '../models/quotation.model';
import { InvoiceResponse } from '../models/invoice.model';
import { PageResponse } from '../models/page-response.model';

@Injectable({ providedIn: 'root' })
export class QuotationService {
  private url = `${environment.apiUrl}/quotations`;

  constructor(private http: HttpClient) {}

  findAll(search = '', page = 0, size = 10): Observable<PageResponse<QuotationResponse>> {
    const params = new HttpParams().set('search', search).set('page', page).set('size', size);
    return this.http.get<PageResponse<QuotationResponse>>(this.url, { params });
  }

  findById(id: number): Observable<QuotationResponse> {
    return this.http.get<QuotationResponse>(`${this.url}/${id}`);
  }

  create(req: QuotationRequest): Observable<QuotationResponse> {
    return this.http.post<QuotationResponse>(this.url, req);
  }

  update(id: number, req: QuotationRequest): Observable<QuotationResponse> {
    return this.http.put<QuotationResponse>(`${this.url}/${id}`, req);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  updateStatus(id: number, status: string): Observable<QuotationResponse> {
    return this.http.patch<QuotationResponse>(`${this.url}/${id}/status`, { status });
  }

  convertToOrder(id: number): Observable<QuotationResponse> {
    return this.http.post<QuotationResponse>(`${this.url}/${id}/convert`, {});
  }

  convertToInvoice(id: number): Observable<InvoiceResponse> {
    return this.http.post<InvoiceResponse>(`${this.url}/${id}/convert-to-invoice`, {});
  }
}
