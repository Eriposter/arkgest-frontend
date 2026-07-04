import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = '/api/profile';

  constructor(private http: HttpClient) {}

  getProfile(): Observable<User> {
    return this.http.get<User>(this.apiUrl);
  }

  updateProfile(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData);
  }

  changePassword(data: { current_password: string; password: string; password_confirmation: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/change-password`, data);
  }
}