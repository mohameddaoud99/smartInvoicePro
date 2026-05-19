import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserRequest, UserResponse } from '../models/user.model';
import { PageResponse } from '../models/page-response.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private url = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  findAll(search = '', page = 0, size = 10, sortBy = 'id', direction = 'asc'): Observable<PageResponse<UserResponse>> {
    const params = new HttpParams()
      .set('search', search).set('page', page).set('size', size)
      .set('sortBy', sortBy).set('direction', direction);
    return this.http.get<PageResponse<UserResponse>>(this.url, { params });
  }

  findById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.url}/${id}`);
  }

  create(req: UserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.url, req);
  }

  update(id: number, req: UserRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.url}/${id}`, req);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  toggleActive(id: number): Observable<void> {
    return this.http.patch<void>(`${this.url}/${id}/toggle-active`, {});
  }
}
