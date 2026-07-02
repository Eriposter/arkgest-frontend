import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = '/api/clients';

  constructor(private http: HttpClient) {}

  getClients(params?: { search?: string; status?: string; type?: string }): Observable<Client[]> {
    let httpParams = new HttpParams();
    if (params) {
      (Object.keys(params) as Array<keyof typeof params>).forEach(key => {
        const value = params[key];
        if (value) {
          httpParams = httpParams.set(key as string, value);
        }
      });
    }
    return this.http.get<Client[]>(this.apiUrl, { params: httpParams });
  }

  getClient(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`);
  }

  createClient(data: Partial<Client>): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, data);
  }

  updateClient(id: number, data: Partial<Client>): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/${id}`, data);
  }

  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}