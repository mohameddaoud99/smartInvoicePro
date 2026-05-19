import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RoleRequest, RoleResponse } from '../models/role.model';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private url = `${environment.apiUrl}/roles`;

  constructor(private http: HttpClient) {}

  findAll(): Observable<RoleResponse[]> {
    return this.http.get<RoleResponse[]>(this.url);
  }

  findById(id: number): Observable<RoleResponse> {
    return this.http.get<RoleResponse>(`${this.url}/${id}`);
  }

  create(req: RoleRequest): Observable<RoleResponse> {
    return this.http.post<RoleResponse>(this.url, req);
  }

  update(id: number, req: RoleRequest): Observable<RoleResponse> {
    return this.http.put<RoleResponse>(`${this.url}/${id}`, req);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
