import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = '/api/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  getUserDetails(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/details`);
  }

  createUser(data: any): Observable<User> {
    return this.http.post<User>(this.apiUrl, data);
  }

  updateUser(id: number, data: any): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, data);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/roles`);
  }

  // ✅ Aceitar string | undefined
  getRoleBadge(role?: string): string {
    if (!role) return 'bg-gray-100 text-gray-700 border-gray-200';
    const badges: any = {
      'admin': 'bg-purple-100 text-purple-700 border-purple-200',
      'gestor': 'bg-blue-100 text-blue-700 border-blue-200',
      'arquiteto': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'estagiario': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return badges[role] || 'bg-gray-100 text-gray-700 border-gray-200';
  }

  getRoleLabel(role?: string): string {
    if (!role) return 'Sem perfil';
    const labels: any = {
      'admin': 'Administrador',
      'gestor': 'Gestor',
      'arquiteto': 'Arquiteto',
      'estagiario': 'Estagiário'
    };
    return labels[role] || role;
  }
}