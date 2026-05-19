import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CategoryDTO, CategoryRequestDTO } from '../models/category.model';
import { PageResponse } from '../models/page-response.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private url = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  findAll(page = 0, size = 10): Observable<PageResponse<CategoryDTO>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<CategoryDTO>>(this.url, { params });
  }

  findAllList(): Observable<CategoryDTO[]> {
    return this.http.get<CategoryDTO[]>(`${this.url}/all`);
  }

  findById(id: number): Observable<CategoryDTO> {
    return this.http.get<CategoryDTO>(`${this.url}/${id}`);
  }

  create(req: CategoryRequestDTO): Observable<CategoryDTO> {
    return this.http.post<CategoryDTO>(this.url, req);
  }

  update(id: number, req: CategoryRequestDTO): Observable<CategoryDTO> {
    return this.http.put<CategoryDTO>(`${this.url}/${id}`, req);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
