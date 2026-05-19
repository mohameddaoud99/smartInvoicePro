import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CustomerRequest, CustomerResponse } from '../models/customer.model';
import { PageResponse } from '../models/page-response.model';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private url = `${environment.apiUrl}/customers`;

  constructor(private http: HttpClient) {}

  findAll(search = '', page = 0, size = 10): Observable<PageResponse<CustomerResponse>> {
    const params = new HttpParams().set('search', search).set('page', page).set('size', size);
    return this.http.get<PageResponse<CustomerResponse>>(this.url, { params });
  }

  findAllList(): Observable<CustomerResponse[]> {
    return this.findAll('', 0, 1000).pipe(map(res => res.content));
  }

  findById(id: number): Observable<CustomerResponse> {
    return this.http.get<CustomerResponse>(`${this.url}/${id}`);
  }

  create(req: CustomerRequest): Observable<CustomerResponse> {
    return this.http.post<CustomerResponse>(this.url, req);
  }

  update(id: number, req: CustomerRequest): Observable<CustomerResponse> {
    return this.http.put<CustomerResponse>(`${this.url}/${id}`, req);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  toggleActive(id: number): Observable<void> {
    return this.http.patch<void>(`${this.url}/${id}/toggle-active`, {});
  }
}
