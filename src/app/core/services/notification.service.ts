import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotificationResponse } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = '/api/notifications';

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<NotificationResponse> {
    return this.http.get<NotificationResponse>(this.apiUrl);
  }

  markAsRead(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/read`, {});
  }

  markAllAsRead(): Observable<any> {
    return this.http.post(`${this.apiUrl}/read-all`, {});
  }
}