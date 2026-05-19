import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InvoiceRequest, InvoiceResponse } from '../models/invoice.model';
import { PageResponse } from '../models/page-response.model';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private url = `${environment.apiUrl}/invoices`;

  constructor(private http: HttpClient) {}

  findAll(search = '', page = 0, size = 10): Observable<PageResponse<InvoiceResponse>> {
    const params = new HttpParams().set('search', search).set('page', page).set('size', size);
    return this.http.get<PageResponse<InvoiceResponse>>(this.url, { params });
  }

  findById(id: number): Observable<InvoiceResponse> {
    return this.http.get<InvoiceResponse>(`${this.url}/${id}`);
  }

  create(req: InvoiceRequest): Observable<InvoiceResponse> {
    return this.http.post<InvoiceResponse>(this.url, req);
  }

  update(id: number, req: InvoiceRequest): Observable<InvoiceResponse> {
    return this.http.put<InvoiceResponse>(`${this.url}/${id}`, req);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  updateStatus(id: number, status: string): Observable<InvoiceResponse> {
    return this.http.patch<InvoiceResponse>(`${this.url}/${id}/status`, { status });
  }

  downloadPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.url}/${id}/pdf`, { responseType: 'blob' });
  }
}
