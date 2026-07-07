import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = '/api/notifications';
  private refresh$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  markAsRead(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/read`, {});
  }

  markAllAsRead(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/read-all`, {});
  }

  // ✅ Método para forçar refresh
  refreshNotifications(): void {
    this.refresh$.next();
  }

  // ✅ Observable para componentes ouvirem
  onRefresh() {
    return this.refresh$.asObservable();
  }
}