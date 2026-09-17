import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PromotionService, ProductWithPromotion } from '../services/promotion.service';
import { map } from 'rxjs/operators';

export interface ProductResponse {
  id: number;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  imageUrl?: string;
  active: boolean;
}

export interface ProductCreateRequest {
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  imageUrl?: string;
  active?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(
    private http: HttpClient,
    private promotionService: PromotionService
  ) { }

  getProducts(keyword?: string, minPrice?: number, maxPrice?: number): Observable<ProductWithPromotion[]> {
    let params = new HttpParams();
    if (keyword) params = params.set('keyword', keyword);
    if (minPrice !== undefined) params = params.set('minPrice', minPrice.toString());
    if (maxPrice !== undefined) params = params.set('maxPrice', maxPrice.toString());
    
    return this.http.get<ProductResponse[]>(this.apiUrl, { params }).pipe(
      map(products => this.promotionService.applyPromotionsToProducts(products))
    );
  }

  getProductById(id: number): Observable<ProductWithPromotion> {
    return this.http.get<ProductResponse>(`${this.apiUrl}/${id}`).pipe(
      map(product => this.promotionService.applyPromotionToProduct(product))
    );
  }

  createProduct(productData: ProductCreateRequest): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(this.apiUrl, productData);
  }

  updateProduct(id: number, productData: ProductCreateRequest): Observable<ProductResponse> {
    return this.http.put<ProductResponse>(`${this.apiUrl}/${id}`, productData);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}