import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ProductDTO, ProductRequestDTO } from '../models/product.model';
import { PageResponse } from '../models/page-response.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private url = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  findAll(page = 0, size = 10): Observable<PageResponse<ProductDTO>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<ProductDTO>>(this.url, { params });
  }

  findAllList(): Observable<ProductDTO[]> {
    return this.findAll(0, 1000).pipe(map(res => res.content));
  }

  findById(id: number): Observable<ProductDTO> {
    return this.http.get<ProductDTO>(`${this.url}/${id}`);
  }

  create(req: ProductRequestDTO): Observable<ProductDTO> {
    return this.http.post<ProductDTO>(this.url, this.toFormData(req));
  }

  update(id: number, req: ProductRequestDTO): Observable<ProductDTO> {
    return this.http.put<ProductDTO>(`${this.url}/${id}`, this.toFormData(req));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  private toFormData(req: ProductRequestDTO): FormData {
    const fd = new FormData();
    fd.append('libelle', req.libelle);
    fd.append('code', req.code);
    fd.append('tva', req.tva.toString());
    fd.append('prix', req.prix.toString());
    if (req.description) fd.append('description', req.description);
    if (req.categoryId)  fd.append('categoryId', req.categoryId.toString());
    if (req.photo1) fd.append('photo1', req.photo1);
    if (req.photo2) fd.append('photo2', req.photo2);
    if (req.photo3) fd.append('photo3', req.photo3);
    return fd;
  }
}
