import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private apiUrl = '/api/audit-logs';

  constructor(private http: HttpClient) {}

  getAuditLogs(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) httpParams = httpParams.set(key, params[key]);
      });
    }
    return this.http.get<any>(this.apiUrl, { params: httpParams });
  }

  getEventLabel(event: string): string {
    const labels: any = {
      'created': 'Criado',
      'updated': 'Atualizado',
      'deleted': 'Eliminado',
      'restored': 'Restaurado'
    };
    return labels[event] || event;
  }

  getEventColor(event: string): string {
    const colors: any = {
      'created': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'updated': 'bg-blue-100 text-blue-700 border-blue-200',
      'deleted': 'bg-red-100 text-red-700 border-red-200',
      'restored': 'bg-amber-100 text-amber-700 border-amber-200'
    };
    return colors[event] || 'bg-gray-100 text-gray-700';
  }

  getSubjectIcon(type: string): string {
    const icons: any = {
      'Project': 'projects',
      'Client': 'clients',
      'Task': 'tasks',
      'Invoice': 'invoices',
      'Meeting': 'calendar',
      'User': 'users'
    };
    return icons[type] || 'file';
  }
}