import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrderRequest, OrderResponse } from '../models/order.model';
import { InvoiceResponse } from '../models/invoice.model';
import { PageResponse } from '../models/page-response.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private url = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  findAll(search = '', page = 0, size = 10): Observable<PageResponse<OrderResponse>> {
    const params = new HttpParams().set('search', search).set('page', page).set('size', size);
    return this.http.get<PageResponse<OrderResponse>>(this.url, { params });
  }

  findById(id: number): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.url}/${id}`);
  }

  create(req: OrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(this.url, req);
  }

  update(id: number, req: OrderRequest): Observable<OrderResponse> {
    return this.http.put<OrderResponse>(`${this.url}/${id}`, req);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  updateStatus(id: number, status: string): Observable<OrderResponse> {
    return this.http.patch<OrderResponse>(`${this.url}/${id}/status`, { status });
  }

  convertToInvoice(id: number): Observable<InvoiceResponse> {
    return this.http.post<InvoiceResponse>(`${this.url}/${id}/convert-to-invoice`, {});
  }
}
