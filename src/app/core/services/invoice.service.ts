import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invoice } from '../models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = '/api/invoices';

  constructor(private http: HttpClient) {}

  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.apiUrl);
  }

  getInvoice(id: number): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/${id}`);
  }

  getInvoiceDetails(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/details`);
  }

  createInvoice(data: any): Observable<Invoice> {
    return this.http.post<Invoice>(this.apiUrl, data);
  }

  updateInvoice(id: number, data: any): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.apiUrl}/${id}`, data);
  }

  deleteInvoice(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  markAsPaid(id: number): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.apiUrl}/${id}/mark-as-paid`, {});
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-AO', { 
      style: 'currency', 
      currency: 'AOA',
      minimumFractionDigits: 2
    }).format(value || 0);
  }
}